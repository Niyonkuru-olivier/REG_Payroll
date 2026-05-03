import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Check if category_code already exists
    const existing = await this.prisma.system_categories.findUnique({
      where: { category_code: createCategoryDto.category_code },
    });

    if (existing) {
      throw new ConflictException('Category ID already exists');
    }

    return this.prisma.system_categories.create({
      data: {
        category_name: createCategoryDto.category_name,
        category_code: createCategoryDto.category_code,
        status: createCategoryDto.status || 'ACTIVE',
      },
    });
  }

  async findAll() {
    return this.prisma.system_categories.findMany();
  }

  async findOne(id: number) {
    const category = await this.prisma.system_categories.findUnique({
      where: { category_id: id },
    });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (updateCategoryDto.category_code && updateCategoryDto.category_code !== category.category_code) {
      const existing = await this.prisma.system_categories.findUnique({
        where: { category_code: updateCategoryDto.category_code },
      });
      if (existing) {
        throw new ConflictException('Category ID already exists');
      }
    }

    return this.prisma.system_categories.update({
      where: { category_id: id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    // Note: Database level deletion logic. 
    // The frontend should have already validated if it is in use by checking user lists.
    // However, if we had foreign keys we'd check them here too.
    
    // Hard delete
    return this.prisma.system_categories.delete({
      where: { category_id: id },
    });
  }
}
