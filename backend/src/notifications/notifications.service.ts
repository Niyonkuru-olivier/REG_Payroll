import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findForUser(userId: number) {
    return this.prisma.notifications.findMany({
      where: { recipient_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async markAsRead(id: number) {
    return this.prisma.notifications.update({
      where: { notification_id: id },
      data: { is_read: true, read_at: new Date() },
    });
  }

  async create(data: any) {
    return this.prisma.notifications.create({
      data,
    });
  }
}
