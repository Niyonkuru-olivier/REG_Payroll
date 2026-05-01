import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, companyId: number) {
    return this.prisma.posts.create({
      data: { ...data, company_id: companyId },
    });
  }

  async findAll(companyId: number) {
    return this.prisma.posts.findMany({
      where: { company_id: companyId },
      include: {
        departments: true,
      },
    });
  }

  async findOne(id: number, companyId: number) {
    const post = await this.prisma.posts.findUnique({
      where: { post_id: id },
      include: {
        departments: true,
      },
    });
    if (!post || post.company_id !== companyId) {
      throw new NotFoundException(
        `Post with ID ${id} not found or access denied`,
      );
    }
    return post;
  }

  async update(id: number, data: any, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.posts.update({
      where: { post_id: id },
      data,
    });
  }

  async remove(id: number, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.posts.update({
      where: { post_id: id },
      data: { is_active: false },
    });
  }
}
