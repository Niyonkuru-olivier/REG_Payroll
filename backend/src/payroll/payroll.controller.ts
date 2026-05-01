import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { hr_users_role } from '@prisma/client';
import type { RequestWithUser } from '../common/interfaces/request.interface';

@ApiTags('payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Roles(hr_users_role.BranchHR, hr_users_role.SuperAdmin)
  @Post('run')
  @ApiOperation({
    summary: 'Run payroll for a company for a specific period and frequency',
  })
  runPayroll(
    @Req() req: RequestWithUser,
    @Body()
    body: {
      companyId?: number;
      month?: number;
      year?: number;
      frequency?: string;
      periodStart?: string;
    },
  ) {
    if (!req.user) throw new BadRequestException('User context missing');
    const companyId =
      req.user.role === hr_users_role.PlatformAdmin
        ? body.companyId || req.user.companyId
        : req.user.companyId;
    if (!companyId) throw new BadRequestException('Company ID is required');

    let frequency = (body.frequency || 'monthly').toLowerCase();
    let periodStart: Date;
    if (body.month && body.year) {
      periodStart = new Date(body.year, body.month - 1, 1);
      frequency = 'monthly';
    } else if (body.periodStart) {
      periodStart = new Date(body.periodStart);
    } else {
      // default to today as period start
      periodStart = new Date();
    }

    return this.payrollService.runPayroll(
      companyId,
      periodStart,
      frequency,
      req.user.userId,
    );
  }

  @Get('my-payslips')
  @ApiOperation({ summary: 'Get my own payslips (Employee only)' })
  getMyPayslips(@Req() req: RequestWithUser) {
    if (!req.user.employeeId) {
      throw new BadRequestException(
        'User is not associated with an employee profile',
      );
    }
    return this.payrollService.getPayslips(
      req.user.employeeId,
      req.user.companyId,
    );
  }

  @Roles(hr_users_role.BranchHR, hr_users_role.SuperAdmin)
  @Get('payslips/:employeeId')
  @ApiOperation({
    summary: 'Get payslips for a specific employee (HR/Admin only)',
  })
  getEmployeePayslips(@Req() req, @Param('employeeId') id: string) {
    return this.payrollService.getPayslips(+id, req.user.companyId);
  }
}
