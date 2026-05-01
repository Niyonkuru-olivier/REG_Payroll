import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as math from 'mathjs';
import {
  payslips_payment_status,
  payslips_payment_mode,
  payroll_batches_status,
  salary_components_component_type,
  salary_components_calculation_type,
  Prisma,
} from '@prisma/client';

import { AuditService } from '../audit/audit.service';

@Injectable()
export class PayrollService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async runPayroll(
    companyId: number,
    periodStart: Date,
    frequency: 'monthly' | 'biweekly' | 'weekly' | '15-day' | 'daily' | string,
    performedBy?: number,
    options?: { index?: number },
  ) {
    frequency = (frequency || 'monthly').toString().toLowerCase();
    const index = options?.index || 1;

    // derive month/year from periodStart
    const month = periodStart.getMonth() + 1;
    const year = periodStart.getFullYear();

    // compute pay period start/end based on frequency and index
    const lastDay = new Date(year, month, 0).getDate();
    let startDay = 1;
    let endDay = lastDay;
    let label = 'Monthly';

    if (frequency === '15-day' || frequency === '15day') {
      if (index === 2) {
        startDay = 16;
        endDay = lastDay;
        label = 'Semi-monthly (2nd)';
      } else {
        startDay = 1;
        endDay = Math.min(15, lastDay);
        label = 'Semi-monthly (1st)';
      }
    } else if (frequency === 'biweekly' || frequency === 'fortnight') {
      startDay = 1 + (index - 1) * 14;
      endDay = Math.min(lastDay, startDay + 13);
      label = `Biweekly #${index}`;
    } else if (frequency === 'weekly') {
      startDay = 1 + (index - 1) * 7;
      endDay = Math.min(lastDay, startDay + 6);
      label = `Weekly #${index}`;
    } else if (frequency === 'daily') {
      startDay = periodStart.getDate();
      endDay = startDay;
      label = `Daily ${startDay}/${month}/${year}`;
    }

    const pay_period_start = new Date(year, month - 1, startDay);
    const pay_period_end = new Date(year, month - 1, endDay);

    // 0. Check for existing batch to prevent duplicates (CRITICAL)
    const existingBatch = await this.prisma.payroll_batches.findFirst({
      where: {
        company_id: companyId,
        pay_period_start: pay_period_start,
        pay_period_end: pay_period_end,
        status: { not: payroll_batches_status.Cancelled },
      },
    });
    if (existingBatch) {
      throw new BadRequestException(
        `${label} payroll for period already processed.`,
      );
    }

    // 1. Get all active employees for company
    const employees = await this.prisma.employees.findMany({
      where: { company_id: companyId, is_active: true },
    });

    // 2. Get active salary components/rules for company
    const globalRules = await this.prisma.salary_components.findMany({
      where: { company_id: companyId, is_active: true },
    });

    // 3. Create a Payroll Batch
    // We'll take the first branch of the company or a default one if needed
    const firstBranch = await this.prisma.branches.findFirst({
      where: { company_id: companyId },
    });
    if (!firstBranch) throw new BadRequestException('Company has no branches');

    const batch = await this.prisma.payroll_batches.create({
      data: {
        company_id: companyId,
        branch_id: firstBranch.branch_id,
        batch_code: `PAY-${month}-${year}-${Date.now()}`,
        status: payroll_batches_status.Calculated,
        total_employees: employees.length,
        total_gross: 0,
        total_deductions: 0,
        total_net_payable: 0,
        pay_period_start,
        pay_period_end,
        pay_date: new Date(),
        remarks: label,
      },
    });

    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    for (const employee of employees) {
      const basicSalary = Number(employee.current_base_salary) || 0;
      let additions = 0;
      let deductions = 0;

      const context = {
        basicSalary,
        grossSalary: basicSalary,
      };

      // fetch salary components for this employee
      const esc = await this.prisma.employee_salary_components.findMany({
        where: { employee_id: employee.employee_id },
        include: { salary_components: true },
      });
      const components = esc.map((e) => e.salary_components).filter(Boolean);

      for (const comp of components) {
        let value = 0;
        if (
          comp.calculation_type === salary_components_calculation_type.Fixed
        ) {
          value = Number(comp.default_value) || 0;
        } else if (
          comp.calculation_type ===
            salary_components_calculation_type.Formula &&
          comp.formula
        ) {
          const formula = comp.formula;
          try {
            // Security: Use a clean scope
            const forbiddenPatterns = [
              'process',
              'eval',
              'require',
              'function',
              '=>',
            ];
            if (
              forbiddenPatterns.some((pattern) =>
                formula.toLowerCase().includes(pattern),
              )
            ) {
              throw new Error('Forbidden pattern detected in formula');
            }
            value = math.evaluate(formula, context);
            if (isNaN(value)) value = 0;
          } catch (e) {
            console.error(
              `Error evaluating formula for ${comp.component_name}:`,
              e,
            );
          }
        }

        if (comp.component_type === salary_components_component_type.Earning) {
          additions += value;
        } else {
          deductions += value;
        }
      }

      const grossSalary = basicSalary + additions;
      const netSalary = Math.max(0, grossSalary - deductions);

      totalGross += grossSalary;
      totalNet += netSalary;
      totalDeductions += deductions;

      await this.prisma.payslips.create({
        data: {
          employee_id: employee.employee_id,
          company_id: companyId,
          batch_id: batch.batch_id,
          payslip_number: `PSL-${employee.employee_code}-${month}-${year}-${Date.now()}`,
          basic_salary: new Prisma.Decimal(basicSalary),
          total_earnings: new Prisma.Decimal(grossSalary),
          total_deductions: new Prisma.Decimal(deductions),
          net_payable: new Prisma.Decimal(netSalary),
          payment_status: payslips_payment_status.Pending,
          payment_mode: payslips_payment_mode.BankTransfer,
          calculation_data: JSON.stringify({
            frequency,
            index,
            pay_period_start,
            pay_period_end,
          }),
        },
      });
    }

    await this.prisma.payroll_batches.update({
      where: { batch_id: batch.batch_id },
      data: {
        total_gross: new Prisma.Decimal(totalGross),
        total_net_payable: new Prisma.Decimal(totalNet),
        total_deductions: new Prisma.Decimal(totalDeductions),
        total_employees: employees.length,
      },
    });

    await this.audit.log({
      companyId,
      userId: performedBy,
      userType: 'HR_USER',
      action: 'PAYROLL_RUN',
      entityType: 'payroll_batches',
      entityId: batch.batch_id,
      newValues: {
        periodStart: pay_period_start,
        periodEnd: pay_period_end,
        totalGross,
        totalNet,
      },
      remarks: `Payroll processed for period ${pay_period_start.toISOString().slice(0, 10)} - ${pay_period_end.toISOString().slice(0, 10)}`,
    });

    return {
      message: 'Payroll run successfully',
      batchId: batch.batch_id,
      totalEmployees: employees.length,
      totalNetSalary: totalNet,
    };
  }

  async getPayslips(employeeId: number, companyId: number) {
    return this.prisma.payslips.findMany({
      where: {
        employee_id: employeeId,
        company_id: companyId, // Multi-tenant scoping (CRITICAL)
      },
      orderBy: [{ created_at: 'desc' }],
    });
  }
}
