import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalarySettingsService {
  constructor(private prisma: PrismaService) {}

  async getConfigurations(companyId: number) {
    return this.prisma.salary_configurations.findMany({
      where: { company_id: companyId },
    });
  }

  async upsertConfiguration(companyId: number, data: any) {
    const categoryId = Number(data.category_id);

    // Handle both raw data (strings/numbers) and Prisma Decimal objects
    const toNum = (val: any) => {
      if (val === null || val === undefined) return 0;
      if (typeof val.toNumber === 'function') return val.toNumber();
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    };

    const basicSalary = toNum(data.basic_salary);
    
    if (basicSalary < 1) {
      throw new BadRequestException("Basic Salary is required and must be at least 1 RWF");
    }

    const transportAllowance = toNum(data.transport_allowance);
    const housingAllowance = toNum(data.housing_allowance);
    const mealAllowance = toNum(data.meal_allowance);
    const performanceBonus = toNum(data.performance_bonus);
    const projectBonus = toNum(data.project_bonus);

    const grossSalary = basicSalary + transportAllowance + housingAllowance + mealAllowance + performanceBonus + projectBonus;

    // Get deductions for this category
    const deductions = await this.prisma.category_deductions.findMany({
      where: { category_id: categoryId, is_enabled: true }
    });
    const totalDeductionPercentage = deductions.reduce((acc, d) => acc + toNum(d.percentage), 0);
    const totalDeductions = (totalDeductionPercentage / 100) * grossSalary;
    const netSalary = Math.max(0, grossSalary - totalDeductions);

    const result = await this.prisma.salary_configurations.upsert({
      where: { category_id: categoryId },
      update: {
        basic_salary: new Prisma.Decimal(basicSalary),
        transport_allowance: new Prisma.Decimal(transportAllowance),
        housing_allowance: new Prisma.Decimal(housingAllowance),
        meal_allowance: new Prisma.Decimal(mealAllowance),
        performance_bonus: new Prisma.Decimal(performanceBonus),
        project_bonus: new Prisma.Decimal(projectBonus),
        gross_salary: new Prisma.Decimal(grossSalary),
        net_salary: new Prisma.Decimal(netSalary),
      },
      create: {
        company_id: companyId,
        category_id: categoryId,
        basic_salary: new Prisma.Decimal(basicSalary),
        transport_allowance: new Prisma.Decimal(transportAllowance),
        housing_allowance: new Prisma.Decimal(housingAllowance),
        meal_allowance: new Prisma.Decimal(mealAllowance),
        performance_bonus: new Prisma.Decimal(performanceBonus),
        project_bonus: new Prisma.Decimal(projectBonus),
        gross_salary: new Prisma.Decimal(grossSalary),
        net_salary: new Prisma.Decimal(netSalary),
      },
    });

    // Recalculate for all employees in this category
    await this.syncPayrollRecords(categoryId, grossSalary, totalDeductions, netSalary);

    return result;
  }

  async syncPayrollRecords(categoryId: number, grossSalary: number, totalDeductions: number, netSalary: number) {
    const employees = await this.prisma.employees.findMany({
      where: { category_id: categoryId, is_active: true }
    });

    for (const emp of employees) {
      await this.prisma.payroll_records.upsert({
        where: { employee_id: emp.employee_id },
        update: {
          category_id: categoryId,
          gross_salary: grossSalary,
          total_deductions: totalDeductions,
          net_salary: netSalary,
        },
        create: {
          employee_id: emp.employee_id,
          category_id: categoryId,
          gross_salary: grossSalary,
          total_deductions: totalDeductions,
          net_salary: netSalary,
          payment_status: 'Pending',
        },
      });
    }
  }

  async getDeductions(companyId: number, categoryId?: number) {
    if (categoryId) {
      return this.prisma.category_deductions.findMany({
        where: { category_id: categoryId }
      });
    }
    return this.prisma.category_deductions.findMany();
  }

  async updateDeductions(companyId: number, data: any) {
    const categoryId = Number(data.category_id);
    if (!categoryId) throw new BadRequestException("category_id is required");

    await this.prisma.$transaction(async (tx) => {
      // 1. Clear existing deductions for this category
      await tx.category_deductions.deleteMany({
        where: { category_id: categoryId }
      });

      // 2. Insert new rules
      if (Array.isArray(data.deductions)) {
        for (const d of data.deductions) {
          await tx.category_deductions.create({
            data: {
              category_id: categoryId,
              deduction_name: d.deduction_name,
              percentage: Number(d.percentage),
              is_enabled: d.is_enabled ?? true
            }
          });
        }
      }
    });

    // 3. After updating deductions, recalculate salary for the category
    const config = await this.prisma.salary_configurations.findUnique({
      where: { category_id: categoryId }
    });
    
    if (config) {
      const basicSalary = typeof (config.basic_salary as any).toNumber === 'function' 
        ? (config.basic_salary as any).toNumber() 
        : Number(config.basic_salary);

      if (basicSalary >= 1) {
        try {
          await this.upsertConfiguration(companyId, {
            category_id: config.category_id,
            basic_salary: config.basic_salary,
            transport_allowance: config.transport_allowance,
            housing_allowance: config.housing_allowance,
            meal_allowance: config.meal_allowance,
            performance_bonus: config.performance_bonus,
            project_bonus: config.project_bonus
          });
        } catch (recalcErr) {
          console.error("Delayed recalculation failed:", recalcErr.message);
          // We don't throw here to avoid failing the whole request since deductions were saved
        }
      }
    }

    return { message: "Deductions updated and salaries recalculated" };
  }

  async deleteDeduction(categoryId: number, deductionName: string) {
    await this.prisma.category_deductions.delete({
      where: {
        category_id_deduction_name: {
          category_id: categoryId,
          deduction_name: deductionName
        }
      }
    });
    
    // Recalculate
    const config = await this.prisma.salary_configurations.findUnique({
      where: { category_id: categoryId }
    });
    if (config) {
      await this.upsertConfiguration(config.company_id, config);
    }
  }
}
