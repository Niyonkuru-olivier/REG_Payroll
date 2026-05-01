import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, companyId: number, creatorRole: string) {
    const status = creatorRole === 'SuperAdmin' ? 'Approved' : 'Pending';
    return this.prisma.branches.create({
      data: { ...data, company_id: companyId, status },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.branches.findMany({
      where: { company_id: companyId },
    });
  }

  async findOne(id: number, companyId: number) {
    const branch = await this.prisma.branches.findUnique({
      where: { branch_id: id },
    });
    if (!branch || branch.company_id !== companyId) {
      throw new Error('Branch not found or access denied');
    }
    return branch;
  }

  async update(id: number, data: any, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.branches.update({
      where: { branch_id: id },
      data,
    });
  }

  async approve(id: number, status: string, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.branches.update({
      where: { branch_id: id },
      data: { status },
    });
  }
}
