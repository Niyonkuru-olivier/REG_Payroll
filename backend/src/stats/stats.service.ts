import { Injectable } from '@nestjs/common';
import { hr_users_role } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly allowedRoles: hr_users_role[] = [
    hr_users_role.PlatformAdmin,
    hr_users_role.SuperAdmin,
    hr_users_role.CompanyAdmin,
    hr_users_role.BranchHR,
    hr_users_role.Employee,
  ];

  private normalizeRole(role?: string): string {
    return (role || '').replace(/\s+/g, '').toLowerCase();
  }

  private buildScopedWhere(actor: any) {
    const where: any = {
      role: { in: this.allowedRoles },
    };

    const role = this.normalizeRole(actor?.role);
    if (role === this.normalizeRole(hr_users_role.BranchHR)) {
      where.role = hr_users_role.Employee;
    } else if (role === this.normalizeRole(hr_users_role.Employee)) {
      where.user_id = actor.userId;
    }

    return where;
  }

  async getUserStats(actor: any) {
    const baseWhere = this.buildScopedWhere(actor);

    // explicit mapping per user request
    const totalUsersWhere = {
      ...baseWhere,
      role: {
        in: [
          hr_users_role.SuperAdmin,
          hr_users_role.CompanyAdmin,
          hr_users_role.BranchHR,
          hr_users_role.Employee,
        ],
      },
    };

    const totalEmployeesWhere = {
      ...baseWhere,
      role: hr_users_role.Employee,
    };

    const [totalUsers, activeUsers, blockedUsers, lockedUsers, totalEmployees] = await Promise.all([
      this.prisma.hr_users.count({ where: totalUsersWhere }),
      this.prisma.hr_users.count({ where: { ...baseWhere, is_active: true } }),
      this.prisma.hr_users.count({ where: { ...baseWhere, is_active: false } }),
      this.prisma.hr_users.count({ where: { ...baseWhere, is_locked: true } }),
      this.prisma.hr_users.count({ where: totalEmployeesWhere }),
    ]);

    // Active Roles: number of roles in the system
    const activeRoles = 3;

    return { totalUsers, activeUsers, blockedUsers, lockedUsers, totalEmployees, activeRoles };
  }

  async usersByRole(actor: any) {
    const where = this.buildScopedWhere(actor);

    return this.prisma.hr_users.groupBy({
      by: ['role'],
      where,
      _count: { role: true },
    });
  }

  async usersByBranch(actor: any) {
    const where = this.buildScopedWhere(actor);

    const grouped = await this.prisma.hr_users.groupBy({
      by: ['branch_id'],
      where,
      _count: { branch_id: true },
    });
    return grouped.map((g) => ({
      branchId: g.branch_id,
      count: g._count.branch_id,
    }));
  }
}
