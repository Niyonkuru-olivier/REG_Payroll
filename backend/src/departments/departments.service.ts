import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, companyId: number, creatorRole: string) {
    const status = creatorRole === 'SuperAdmin' ? 'Approved' : 'Pending';
    return this.prisma.departments.create({
      data: { ...data, company_id: companyId, status },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.departments.findMany({
      where: { company_id: companyId },
    });
  }

  async findOne(id: number, companyId: number) {
    const dept = await this.prisma.departments.findUnique({
      where: { department_id: id },
    });
    if (!dept || dept.company_id !== companyId) {
      throw new Error('Department not found or access denied');
    }
    return dept;
  }

  async update(id: number, data: any, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.departments.update({
      where: { department_id: id },
      data,
    });
  }

  async approve(id: number, status: string, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.departments.update({
      where: { department_id: id },
      data: { status },
    });
  }
}
