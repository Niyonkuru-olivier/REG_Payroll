import { Injectable, BadRequestException } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PayrollEligibleService {
  constructor(
    private prisma: PrismaService,
    private payrollService: PayrollService
  ) {}

  async getEligibleEmployees(companyId: number, branchId: number | null | undefined, month: number, year: number) {
    // 1. Get all active employees for this branch (or company if branchId is null)
    const where: any = {
      company_id: companyId,
      is_active: true,
    };
    if (branchId) {
      where.branch_id = branchId;
    }

    const employees = await this.prisma.employees.findMany({
      where,
      include: {
        payroll_record: true,
        system_categories: true,
        payment_profile: true,
      }
    });

    // 2. Find who is already paid for this period
    // A payslip exists for this employee in a batch for this month/year
    const periodStart = new Date(year, month - 1, 1);
    // periodEnd not strictly needed for this check if we check by batch pay_period_start

    const existingPayslips = await this.prisma.payslips.findMany({
      where: {
        company_id: companyId,
        payroll_batches: {
          pay_period_start: periodStart,
          status: { not: 'Cancelled' }
        }
      },
      select: { employee_id: true }
    });

    const paidIds = new Set(existingPayslips.map(p => p.employee_id));

    // 3. Filter and Map
    return employees
      .filter(emp => {
        // Must not be paid
        if (paidIds.has(emp.employee_id)) return false;
        // Must have a payroll record with net_salary > 0
        const record = (emp as any).payroll_record;
        if (!record || Number(record.net_salary) <= 0) return false;
        return true;
      })
      .map(emp => {
        const record = (emp as any).payroll_record;
        const profile = (emp as any).payment_profile;
        const category = (emp as any).system_categories;
        
        return {
          id: emp.employee_id,
          fullName: emp.full_name || `${emp.first_name} ${emp.last_name}`,
          category: category?.category_name || 'N/A',
          paymentMethod: profile?.payment_method || 'N/A',
          paymentNumber: profile?.account_number || profile?.phone_number || '-',
          grossSalary: Number(record.gross_salary),
          totalDeductions: Number(record.total_deductions),
          netSalary: Number(record.net_salary),
          status: 'Eligible'
        };
      });
  }
}
