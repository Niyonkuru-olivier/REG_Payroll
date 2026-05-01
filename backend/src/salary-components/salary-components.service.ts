import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalaryComponentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.salary_componentsCreateInput) {
    return this.prisma.salary_components.create({
      data,
    });
  }

  async findAll(companyId?: number) {
    return this.prisma.salary_components.findMany({
      where: companyId ? { company_id: companyId } : {},
      orderBy: { display_order: 'asc' },
    });
  }

  async findOne(id: number) {
    const component = await this.prisma.salary_components.findUnique({
      where: { component_id: id },
    });
    if (!component)
      throw new NotFoundException(`Salary component with ID ${id} not found`);
    return component;
  }

  async update(id: number, data: Prisma.salary_componentsUpdateInput) {
    return this.prisma.salary_components.update({
      where: { component_id: id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.salary_components.update({
      where: { component_id: id },
      data: { is_active: false },
    });
  }
}
