import prisma from '../../infra/database/prisma';

export class NotificationService {
  async getForUser(organizationId: string, userId: string, limit = 20) {
    return prisma.notification.findMany({
      where: { organizationId, userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(organizationId: string, userId: string) {
    return prisma.notification.count({
      where: { organizationId, userId, isRead: false },
    });
  }

  async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(organizationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { organizationId, userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async create(
    organizationId: string,
    userId: string,
    type: string,
    title: string,
    message: string,
    entityType?: string,
    entityId?: string,
  ) {
    return prisma.notification.create({
      data: { organizationId, userId, type, title, message, entityType, entityId },
    });
  }

  static async createForAllMembers(
    organizationId: string,
    type: string,
    title: string,
    message: string,
    entityType?: string,
    entityId?: string,
  ) {
    const members = await prisma.organizationMember.findMany({
      where: { organizationId, status: 'ACTIVE' },
      select: { userId: true },
    });

    await prisma.notification.createMany({
      data: members.map(m => ({
        organizationId,
        userId: m.userId,
        type,
        title,
        message,
        entityType,
        entityId,
      })),
    });
  }
}
