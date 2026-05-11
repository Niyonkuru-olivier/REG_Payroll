import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PrismaModule } from '../prisma.module';
import { PayrollEligibleService } from './payroll-eligible.service';

@Module({
  imports: [PrismaModule],
  controllers: [PayrollController],
  providers: [PayrollService, PayrollEligibleService],
  exports: [PayrollService, PayrollEligibleService],
})
export class PayrollModule {}
