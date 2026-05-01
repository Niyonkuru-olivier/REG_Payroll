import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hr_users_role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

type SafeUser = {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: hr_users_role;
  company_id: number | null;
  employee_id: number | null;
  branch_id: number | null;
  is_active: boolean;
  is_locked: boolean;
  created_at: Date;
  updated_at: Date;
  profile: Record<string, unknown>;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  private toRole(input: CreateUserDto['role']): hr_users_role {
    if (input === 'SuperAdmin') return hr_users_role.SuperAdmin;
    if (input === 'BranchHR') return hr_users_role.BranchHR;
    return hr_users_role.Employee;
  }

  private toStatusFlags(status: string): { is_active: boolean; is_locked: boolean } {
    if (status === 'LOCKED') return { is_active: true, is_locked: true };
    if (status === 'BLOCKED') return { is_active: false, is_locked: false };
    if (status === 'PENDING') return { is_active: false, is_locked: false };
    return { is_active: true, is_locked: false };
  }

  private parseProfile(permissions?: string | null): Record<string, unknown> {
    if (!permissions) return {};
    try {
      const parsed = JSON.parse(permissions);
      return typeof parsed === 'object' && parsed ? parsed : {};
    } catch {
      return {};
    }
  }

  private sanitizeUser(user: any): SafeUser {
    const { password_hash, refresh_token_hash, activation_token, ...rest } = user;
    return {
      ...rest,
      profile: this.parseProfile(user.permissions),
    };
  }

  private ensureCanReadTarget(actor: any, target: any): void {
    if (actor.role === hr_users_role.SuperAdmin) return;
    if (actor.role === hr_users_role.BranchHR || actor.role === hr_users_role.CompanyAdmin) {
      if (target.role === hr_users_role.SuperAdmin) {
        throw new ForbiddenException('Admin cannot access SuperAdmin records');
      }
      return;
    }
    if (actor.userId !== target.user_id) {
      throw new ForbiddenException('User can only access own profile');
    }
  }

  async findAll(actor: any, query: Record<string, string>) {
    const where: any = {};
    if (actor.role === hr_users_role.BranchHR || actor.role === hr_users_role.CompanyAdmin) {
      where.role = hr_users_role.Employee;
    } else if (actor.role !== hr_users_role.SuperAdmin) {
      where.user_id = actor.userId;
    }

    const search = (query.q || '').trim();
    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
      ];
    }

    if (query.role) {
      where.role = query.role as hr_users_role;
    }

    const users = await this.prisma.hr_users.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return users.map((u) => this.sanitizeUser(u));
  }

  async findOne(actor: any, id: number) {
    const user = await this.prisma.hr_users.findUnique({ where: { user_id: id } });
    if (!user) throw new NotFoundException('User not found');
    this.ensureCanReadTarget(actor, user);
    return this.sanitizeUser(user);
  }

  async create(actor: any, dto: CreateUserDto) {
    const requestedRole = this.toRole(dto.role);

    if (actor.role === hr_users_role.BranchHR || actor.role === hr_users_role.CompanyAdmin) {
      if (requestedRole !== hr_users_role.Employee) {
        throw new ForbiddenException('Admin can only create users with the role of Employee');
      }
    } else if (actor.role !== hr_users_role.SuperAdmin) {
      throw new ForbiddenException('You do not have permission to create users');
    }
    const existing = await this.prisma.hr_users.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (existing) throw new BadRequestException('Email already exists');

    const flags = this.toStatusFlags(dto.status);
    const password = dto.password || 'Reg@12345';
    const password_hash = await bcrypt.hash(password, 10);
    const profile = {
      national_id: dto.national_id,
      phone_number: dto.phone_number,
      date_of_birth: dto.date_of_birth || null,
      branch: dto.branch || null,
      category: dto.category || null,
      contract_type: dto.contract_type || null,
      education_level: dto.education_level || null,
      payment_method: dto.payment_method || null,
      payment_number: dto.payment_number || null,
      status: dto.status,
    };

    const created = await this.prisma.hr_users.create({
      data: {
        email: dto.email.trim().toLowerCase(),
        username: (dto.username || dto.email.split('@')[0]).trim(),
        full_name: dto.full_name.trim(),
        role: this.toRole(dto.role),
        password_hash,
        company_id: actor.companyId || null,
        branch_id: null,
        is_active: flags.is_active,
        is_locked: flags.is_locked,
        permissions: JSON.stringify(profile),
        national_id: dto.national_id || null,
        phone_number: dto.phone_number || null,
        date_of_birth: dto.date_of_birth ? new Date(dto.date_of_birth) : null,
        category: dto.category || null,
        contract_type: dto.contract_type || null,
        education_level: dto.education_level || null,
        contract_start: dto.contract_start ? new Date(dto.contract_start) : null,
        contract_end: dto.contract_end ? new Date(dto.contract_end) : null,
        payment_method: dto.payment_method || null,
        payment_number: dto.payment_number || null,
      },
    });
    return this.sanitizeUser(created);
  }

  async update(actor: any, id: number, dto: UpdateUserDto) {
    const existing = await this.prisma.hr_users.findUnique({ where: { user_id: id } });
    if (!existing) throw new NotFoundException('User not found');

    if (actor.role === hr_users_role.Employee && actor.userId !== id) {
      throw new ForbiddenException('User can only update own profile');
    }
    if ((actor.role === hr_users_role.BranchHR || actor.role === hr_users_role.CompanyAdmin) && existing.role !== hr_users_role.Employee) {
      throw new ForbiddenException('Admin can only edit users');
    }

    // Strip unallowed fields for Employees
    if (actor.role === hr_users_role.Employee) {
      const allowedFields = ['full_name', 'national_id', 'phone_number', 'education_level', 'payment_number'];
      Object.keys(dto).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete (dto as any)[key];
        }
      });
    }

    const currentProfile = this.parseProfile(existing.permissions);
    const nextProfile = {
      ...currentProfile,
      ...(dto.national_id !== undefined ? { national_id: dto.national_id } : {}),
      ...(dto.phone_number !== undefined ? { phone_number: dto.phone_number } : {}),
      ...(dto.date_of_birth !== undefined ? { date_of_birth: dto.date_of_birth } : {}),
      ...(dto.branch !== undefined ? { branch: dto.branch } : {}),
      ...(dto.category !== undefined ? { category: dto.category } : {}),
      ...(dto.contract_type !== undefined ? { contract_type: dto.contract_type } : {}),
      ...(dto.education_level !== undefined ? { education_level: dto.education_level } : {}),
      ...(dto.payment_method !== undefined ? { payment_method: dto.payment_method } : {}),
      ...(dto.payment_number !== undefined ? { payment_number: dto.payment_number } : {}),
    };

    const roleUpdate =
      actor.role === hr_users_role.SuperAdmin && dto.role
        ? { role: this.toRole(dto.role) }
        : {};

    const updated = await this.prisma.hr_users.update({
      where: { user_id: id },
      data: {
        ...(dto.full_name !== undefined ? { full_name: dto.full_name } : {}),
        ...(dto.email !== undefined ? { email: dto.email.trim().toLowerCase() } : {}),
        ...(dto.username !== undefined ? { username: dto.username } : {}),
        ...(dto.national_id !== undefined ? { national_id: dto.national_id } : {}),
        ...(dto.phone_number !== undefined ? { phone_number: dto.phone_number } : {}),
        ...(dto.contract_type !== undefined ? { contract_type: dto.contract_type } : {}),
        ...(dto.contract_start !== undefined ? { contract_start: dto.contract_start ? new Date(dto.contract_start) : null } : {}),
        ...(dto.contract_end !== undefined ? { contract_end: dto.contract_end ? new Date(dto.contract_end) : null } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.payment_method !== undefined ? { payment_method: dto.payment_method } : {}),
        ...(dto.payment_number !== undefined ? { payment_number: dto.payment_number } : {}),
        ...roleUpdate,
        permissions: JSON.stringify(nextProfile),
      },
    });
    return this.sanitizeUser(updated);
  }

  async remove(actor: any, id: number) {
    if (actor.role !== hr_users_role.SuperAdmin) {
      throw new ForbiddenException('Only SuperAdmin can delete users');
    }
    await this.prisma.hr_users.delete({ where: { user_id: id } });
    return { message: 'User deleted successfully' };
  }

  async updateStatus(actor: any, dto: UpdateUserStatusDto) {
    const target = await this.prisma.hr_users.findUnique({
      where: { user_id: dto.userId },
    });
    if (!target) throw new NotFoundException('User not found');

    const profile = this.parseProfile(target.permissions);

    if (actor.role === hr_users_role.BranchHR || actor.role === hr_users_role.CompanyAdmin) {
      if (target.role !== hr_users_role.Employee) {
        throw new ForbiddenException('Admin can only request status updates for users');
      }
      if (dto.status !== 'PENDING') {
        throw new ForbiddenException(
          'Admin status changes require SuperAdmin approval and must be set to PENDING',
        );
      }
      
      const requestedStatus = dto.reason?.split('to ')[1] || 'LOCKED';
      const nextProfile = {
        ...profile,
        status_request: requestedStatus,
        status_reason: dto.reason || null,
      };

      const updated = await this.prisma.hr_users.update({
        where: { user_id: dto.userId },
        data: {
          permissions: JSON.stringify(nextProfile),
        },
      });
      return this.sanitizeUser(updated);

    } else if (actor.role === hr_users_role.SuperAdmin) {
      // If we are passing "APPROVE_PENDING", use the stored request
      let targetStatus = dto.status;
      if (dto.status === 'APPROVE_PENDING') {
        targetStatus = (profile as any).status_request;
        if (!targetStatus) throw new BadRequestException('No pending status to approve');
      } else if (dto.status === 'REJECT_PENDING') {
        // Just clear the request
        const nextProfile = { ...profile };
        delete (nextProfile as any).status_request;
        delete (nextProfile as any).status_reason;
        
        const updated = await this.prisma.hr_users.update({
          where: { user_id: dto.userId },
          data: {
            permissions: JSON.stringify(nextProfile),
          },
        });
        return this.sanitizeUser(updated);
      }

      const flags = this.toStatusFlags(targetStatus);
      const nextProfile = {
        ...profile,
        status: targetStatus,
      };
      delete (nextProfile as any).status_request;
      delete (nextProfile as any).status_reason;

      // Type-cast for account_status
      const accountStatusMap: Record<string, 'ACTIVE' | 'LOCKED' | 'BLOCKED'> = {
        'ACTIVE': 'ACTIVE',
        'LOCKED': 'LOCKED',
        'BLOCKED': 'BLOCKED',
      };

      const updated = await this.prisma.hr_users.update({
        where: { user_id: dto.userId },
        data: {
          is_active: flags.is_active,
          is_locked: flags.is_locked,
          account_status: accountStatusMap[targetStatus] || 'ACTIVE',
          permissions: JSON.stringify(nextProfile),
        },
      });
      return this.sanitizeUser(updated);
    } else {
      throw new ForbiddenException('Not allowed to change status');
    }
  }

  async resetPasswordBySuperAdmin(actor: any, userId: number) {
    if (actor.role !== hr_users_role.SuperAdmin) {
      throw new ForbiddenException('Only SuperAdmin can reset password for users');
    }
    const user = await this.prisma.hr_users.findUnique({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.authService.forgotPassword({ email: user.email });
    return { message: 'Password reset email sent to user' };
  }
}
