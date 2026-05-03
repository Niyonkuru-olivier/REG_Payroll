import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { BranchesModule } from './branches/branches.module';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollModule } from './payroll/payroll.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { PostsModule } from './posts/posts.module';
import { SalaryComponentsModule } from './salary-components/salary-components.module';
import { LeavesModule } from './leaves/leaves.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { StatsModule } from './stats/stats.module';
import { CategoriesModule } from './categories/categories.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompaniesModule,
    BranchesModule,
    DepartmentsModule,
    EmployeesModule,
    AttendanceModule,
    PayrollModule,
    ReportsModule,
    AuditModule,
    PostsModule,
    SalaryComponentsModule,
    LeavesModule,
    NotificationsModule,
    UsersModule,
    StatsModule,
    CategoriesModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
