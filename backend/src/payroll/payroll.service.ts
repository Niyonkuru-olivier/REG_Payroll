import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
  ) { }

  async runPayroll(
    companyId: number,
    periodStart: Date,
    frequency: 'monthly' | 'biweekly' | 'weekly' | '15-day' | 'daily' | string,
    performedBy?: number,
    options?: { index?: number; branchId?: number; employeeIds?: number[] },
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

    // 1. Get employees
    const where: any = { company_id: companyId, is_active: true };
    if (options?.employeeIds && options.employeeIds.length > 0) {
      where.employee_id = { in: options.employeeIds.map(id => Number(id)) };
    } else if (options?.branchId) {
      where.branch_id = Number(options.branchId);
    }

    const employees = await this.prisma.employees.findMany({
      where,
    });

    // 2. Get active salary components/rules for company
    const globalRules = await this.prisma.salary_components.findMany({
      where: { company_id: companyId, is_active: true },
    });

    // 3. Create a Payroll Batch
    let branchId = options?.branchId ? Number(options.branchId) : null;
    if (!branchId) {
      const firstBranch = await this.prisma.branches.findFirst({
        where: { company_id: companyId },
      });
      if (!firstBranch) throw new BadRequestException('Company has no branches');
      branchId = firstBranch.branch_id;
    }

    const batch = await this.prisma.payroll_batches.create({
      data: {
        company_id: companyId,
        branch_id: branchId,
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

    const salaryConfigs = await this.prisma.salary_configurations.findMany({
      where: { company_id: companyId }
    });
    const configMap = new Map<number, any>(salaryConfigs.map(c => [c.category_id, c]));


    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    for (const employee of employees) {
      // 1. Determine Basic Salary (Config vs Individual)
      const config = employee.category_id ? configMap.get(employee.category_id) : null;
      const basicSalary = config ? Number((config as any).basic_salary) : (Number(employee.current_base_salary) || 0);
      
      let additions = 0;
      let deductions = 0;

      // 2. Add Category-specific Allowances/Bonuses
      if (config) {
        additions += Number((config as any).transport_allowance || 0);
        additions += Number((config as any).housing_allowance || 0);
        additions += Number((config as any).meal_allowance || 0);
        additions += Number((config as any).performance_bonus || 0);
        additions += Number((config as any).project_bonus || 0);
      }


      // 3. Dynamic Adjustments (Experience, Education)
      const joinDate = new Date(employee.date_of_joining);
      const now = new Date();
      const experienceYears = Math.max(0, now.getFullYear() - joinDate.getFullYear());
      const educationMap: Record<string, number> = {
        'non-Study': 0, 'primary level': 1, 'A2': 2, 'A1': 3, 'A0': 4, 'Masters Degree': 5, 'PHD': 6
      };
      const educationLevelValue = employee.education_level ? (educationMap[employee.education_level] || 0) : 0;


      const context = {
        basicSalary,
        grossSalary: basicSalary + additions,
        experienceYears,
        educationLevel: educationLevelValue,
      };

      // 4. Custom Salary Components
      const esc = await this.prisma.employee_salary_components.findMany({
        where: { employee_id: employee.employee_id },
        include: { salary_components: true },
      });
      const components = esc.map((e) => e.salary_components).filter(Boolean);

      for (const comp of components) {
        let value = 0;
        if (comp.calculation_type === salary_components_calculation_type.Fixed) {
          value = Number(comp.default_value) || 0;
        } else if (comp.calculation_type === salary_components_calculation_type.Formula && comp.formula) {
          try {
            value = math.evaluate(comp.formula, context);
            if (isNaN(value)) value = 0;
          } catch (e) {
            console.error(`Error evaluating formula for ${comp.component_name}:`, e);
          }
        } else if (comp.calculation_type === salary_components_calculation_type.Percentage) {
            value = (Number(comp.default_value) / 100) * basicSalary;
        }

        if (comp.component_type === salary_components_component_type.Earning) {
          additions += value;
        } else {
          deductions += value;
        }
      }

      const grossSalary = basicSalary + additions;
      
      // 5. Apply Category-specific Deduction Settings
      if (employee.category_id) {
        const catDeductions = await this.prisma.category_deductions.findMany({
          where: { category_id: employee.category_id, is_enabled: true }
        });
        
        for (const d of catDeductions) {
          const deductionVal = (Number(d.percentage) / 100) * grossSalary;
          deductions += deductionVal;
        }
      }

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
            category_id: employee.category_id,
            experience: experienceYears,
            education: employee.education_level,
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

  async getBatches(companyId: number) {
    return this.prisma.payroll_batches.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
      include: { branches: true },
    });
  }

  async getAllPayslips(companyId: number) {
    return this.prisma.payslips.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
      include: {
        employees: true,
        payroll_batches: true,
      },
    });
  }

  async deleteBatch(batchId: number, companyId: number) {
    const batch = await this.prisma.payroll_batches.findUnique({
      where: { batch_id: batchId },
    });

    if (!batch || batch.company_id !== companyId) {
      throw new NotFoundException('Payroll batch not found');
    }

    if (batch.status === payroll_batches_status.Approved || batch.status === payroll_batches_status.Paid) {
      throw new BadRequestException('Cannot delete an approved or paid payroll batch');
    }

    // Use transaction for safe deletion
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete associated payslips
      await tx.payslips.deleteMany({
        where: { batch_id: batchId },
      });

      // 2. Delete the batch itself
      return tx.payroll_batches.delete({
        where: { batch_id: batchId },
      });
    });
  }

  async getPayrollRecords(companyId: number) {
    return this.prisma.payroll_records.findMany({
      where: {
        employees: {
          company_id: companyId
        }
      },
      include: {
        employees: {
          include: {
            payment_profile: true
          }
        }
      }
    });
  }
}


