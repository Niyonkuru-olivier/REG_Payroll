import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { hr_users_role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto, creatorRole: hr_users_role) {
    // Check if user already exists
    const existingUser = await this.prisma.hr_users.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const activationToken = uuidv4();

    // Use transaction to create both User and Employee profile
    return this.prisma.client.$transaction(async (tx) => {
      // 1. Create Employee Profile
      const employee = await tx.employees.create({
        data: {
          employee_code: dto.employeeCode,
          first_name: dto.firstName,
          last_name: dto.lastName,
          date_of_birth: new Date(dto.dateOfBirth),
          gender: dto.gender,
          personal_email: dto.email,
          phone_number: '', // Placeholder
          national_id: dto.nationalId,
          bank_account_number: dto.bankAccount,
          bank_account_holder: `${dto.firstName} ${dto.lastName}`,
          bank_name: 'Default Bank',
          bank_ifsc_code: '0000',
          company_id: dto.companyId,
          branch_id: dto.branchId,
          department_id: dto.departmentId,
          post_id: dto.postId,
          date_of_joining: new Date(),
          current_base_salary: dto.baseSalary,
        },
      });

      // 2. Create User Account linked to Employee
      const user = await tx.hr_users.create({
        data: {
          email: dto.email,
          username: dto.employeeCode,
          full_name: `${dto.firstName} ${dto.lastName}`,
          role: hr_users_role.Employee,
          password_hash: '', // Set on activation
          activation_token: activationToken,
          is_active: false,
          employee_id: employee.employee_id,
        },
      });

      // Update employee status based on creator role
      const status =
        creatorRole === hr_users_role.SuperAdmin ? 'Active' : 'Pending';
      await tx.employees.update({
        where: { employee_id: employee.employee_id },
        data: { employment_status: status },
      });

      return {
        message: 'Employee registered. Activation token generated.',
        employeeId: employee.employee_id,
        userId: user.user_id,
        activationToken,
      };
    });
  }

  async findAll(companyId: number) {
    return this.prisma.employees.findMany({
      where: { company_id: companyId },
    });
  }

  async findOne(id: number, companyId: number) {
    const employee = await this.prisma.employees.findUnique({
      where: { employee_id: id },
    });
    if (!employee || employee.company_id !== companyId) {
      throw new BadRequestException('Employee not found or access denied');
    }
    return employee;
  }

  async getProfile(userId: number) {
    const user = await this.prisma.hr_users.findUnique({
      where: { user_id: userId },
    });
    if (!user) throw new BadRequestException('User not found');
    if (!user.employee_id) return null;
    const employee = await this.prisma.employees.findUnique({
      where: { employee_id: user.employee_id },
    });
    return employee;
  }

  async updateProfile(userId: number, dto: any) {
    const user = await this.prisma.hr_users.findUnique({
      where: { user_id: userId },
    });
    if (!user || !user.employee_id)
      throw new BadRequestException('Employee record not found');

    return this.prisma.employees.update({
      where: { employee_id: user.employee_id },
      data: dto,
    });
  }

  async getSalaryChart(userId: number) {
    const user = await this.prisma.hr_users.findUnique({
      where: { user_id: userId },
    });
    if (!user || !user.employee_id)
      throw new BadRequestException('Employee record not found');

    const payslips = await this.prisma.payslips.findMany({
      where: { employee_id: user.employee_id },
      orderBy: { created_at: 'desc' },
      take: 6,
    });

    return payslips.reverse().map((p) => ({
      month: new Date(p.created_at).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      }),
      netPay: Number(p.net_payable),
    }));
  }

  async getSalaryBreakdown(userId: number) {
    const user = await this.prisma.hr_users.findUnique({
      where: { user_id: userId },
    });
    if (!user || !user.employee_id)
      throw new BadRequestException('Employee record not found');

    // Try to get latest payslip for actual breakdown, or use base salary
    const latestPayslip = await this.prisma.payslips.findFirst({
      where: { employee_id: user.employee_id },
      orderBy: { created_at: 'desc' },
    });

    if (latestPayslip) {
      return [
        { label: 'Basic Salary', value: Number(latestPayslip.basic_salary) },
        {
          label: 'Allowances',
          value:
            Number(latestPayslip.total_earnings) -
            Number(latestPayslip.basic_salary),
        },
        { label: 'Deductions', value: Number(latestPayslip.total_deductions) },
      ];
    }

    const employee = await this.prisma.employees.findUnique({
      where: { employee_id: user.employee_id },
    });
    if (!employee) throw new BadRequestException('Employee profile not found');

    return [
      { label: 'Basic Salary', value: Number(employee.current_base_salary) },
      { label: 'Allowances', value: 0 },
      { label: 'Deductions', value: 0 },
    ];
  }

  async approve(id: number, status: any) {
    return this.prisma.employees.update({
      where: { employee_id: id },
      data: { employment_status: status },
    });
  }

  async transfer(id: number, dto: any) {
    return this.prisma.client.$transaction(async (tx) => {
      // 1. Create transfer record
      const transfer = await tx.employee_transfers.create({
        data: {
          employee_id: id,
          company_id: dto.companyId,
          from_branch_id: dto.fromBranchId,
          to_branch_id: dto.toBranchId,
          from_department_id: dto.fromDepartmentId,
          to_department_id: dto.toDepartmentId,
          from_post_id: dto.fromPostId,
          to_post_id: dto.toPostId,
          transfer_date: new Date(dto.transferDate),
          effective_from: new Date(dto.transferDate),
          transfer_type: dto.transferType || 'Permanent',
          transfer_reason: dto.transferReason,
          status: 'Initiated',
          initiated_by: dto.initiatedBy,
        },
      });

      // 2. Update employee record
      await tx.employees.update({
        where: { employee_id: id },
        data: {
          branch_id: dto.toBranchId,
          department_id: dto.toDepartmentId,
          post_id: dto.toPostId,
          current_base_salary: dto.toBaseSalary,
          employment_status: 'Transferred',
        },
      });

      return transfer;
    });
  }
}
