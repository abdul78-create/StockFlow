import prisma from '../../infra/database/prisma';
import { User, OrganizationMember } from '@prisma/client';

export class UserRepository {
  async findAllByOrganization(organizationId: string): Promise<(User & { role: string })[]> {
    const members = await prisma.organizationMember.findMany({
      where: {
        organizationId,
        user: { deletedAt: null },
      },
      include: {
        user: true,
      },
    });
    return members.map(m => ({ ...m.user, role: m.role }));
  }

  async findById(organizationId: string, id: string): Promise<(User & { role: string }) | null> {
    const member = await prisma.organizationMember.findFirst({
      where: {
        userId: id,
        organizationId,
        user: { deletedAt: null },
      },
      include: {
        user: true,
      },
    });
    if (!member) return null;
    return { ...member.user, role: member.role };
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async createUser(
    organizationId: string,
    email: string,
    passwordHash: string,
    role: string,
    firstName: string,
    lastName: string,
  ): Promise<User & { role: string }> {
    return prisma.$transaction(async (tx) => {
      let user = await tx.user.findFirst({ where: { email } });
      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            passwordHash,
            firstName,
            lastName,
          },
        });
      }

      const member = await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId,
          role,
        },
      });

      return { ...user, role: member.role };
    });
  }

  async updateUser(organizationId: string, id: string, data: { role?: string; firstName?: string; lastName?: string }): Promise<User & { role: string }> {
    return prisma.$transaction(async (tx) => {
      if (data.firstName || data.lastName) {
        await tx.user.update({
          where: { id },
          data: {
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
          },
        });
      }
      
      if (data.role) {
        await tx.organizationMember.update({
          where: { userId_organizationId: { userId: id, organizationId } },
          data: { role: data.role },
        });
      }

      const member = await tx.organizationMember.findUnique({
        where: { userId_organizationId: { userId: id, organizationId } },
        include: { user: true },
      });
      return { ...member!.user, role: member!.role };
    });
  }

  async softDeleteUser(organizationId: string, id: string): Promise<void> {
    // We only suspend the member in this org, not delete the user globally
    await prisma.organizationMember.update({
      where: { userId_organizationId: { userId: id, organizationId } },
      data: { status: 'LEFT' },
    });
  }

  async restoreUser(organizationId: string, id: string): Promise<User & { role: string }> {
    const member = await prisma.organizationMember.update({
      where: { userId_organizationId: { userId: id, organizationId } },
      data: { status: 'ACTIVE' },
      include: { user: true },
    });
    return { ...member.user, role: member.role };
  }
}
