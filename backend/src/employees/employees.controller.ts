import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { hr_users_role } from '@prisma/client';
import type { RequestWithUser } from '../common/interfaces/request.interface';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Roles(hr_users_role.BranchHR, hr_users_role.SuperAdmin)
  @Post()
  @ApiOperation({ summary: 'Register a new employee (HR/Admin only)' })
  create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() req: RequestWithUser,
  ) {
    return this.employeesService.create(createEmployeeDto, req.user.role);
  }

  @Roles(hr_users_role.BranchHR, hr_users_role.SuperAdmin)
  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  findAll(@Req() req: RequestWithUser) {
    return this.employeesService.findAll(req.user.companyId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current employee profile' })
  getProfile(@Req() req: RequestWithUser) {
    return this.employeesService.getProfile(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by id' })
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.employeesService.findOne(+id, req.user.companyId);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update own profile' })
  updateProfile(@Req() req: RequestWithUser, @Body() body: any) {
    return this.employeesService.updateProfile(req.user.userId, body);
  }

  @Get('me/salary-chart')
  @ApiOperation({ summary: 'Get monthly salary chart data' })
  getSalaryChart(@Req() req: RequestWithUser) {
    return this.employeesService.getSalaryChart(req.user.userId);
  }

  @Get('me/salary-breakdown')
  @ApiOperation({ summary: 'Get current salary breakdown for pie chart' })
  getSalaryBreakdown(@Req() req: RequestWithUser) {
    return this.employeesService.getSalaryBreakdown(req.user.userId);
  }

  @Roles(hr_users_role.SuperAdmin)
  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve or reject employee request (Super Admin only)',
  })
  approve(@Param('id') id: string, @Body() body: { status: string }) {
    return this.employeesService.approve(+id, body.status);
  }

  @Roles(hr_users_role.SuperAdmin)
  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer employee to another branch/department' })
  transfer(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: RequestWithUser,
  ) {
    return this.employeesService.transfer(+id, {
      ...body,
      initiatedBy: req.user.userId,
      companyId: req.user.companyId,
    });
  }
}
