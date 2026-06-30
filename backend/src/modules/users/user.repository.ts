import prisma from '../../infra/database/prisma';
import { User } from '@prisma/client';

export class UserRepository {
  async findAllByOrganization(organizationId: string): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        organizationId,
        deletedAt: null, // respect soft delete
      },
    });
  }

  async findById(organizationId: string, id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });
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
  ): Promise<User> {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        firstName,
        lastName,
        organizationId,
      },
    });
  }

  async updateUser(organizationId: string, id: string, data: { role?: string }): Promise<User> {
    return prisma.user.update({
      where: {
        id,
        organizationId, // prisma update requires unique constraint, so we verify org ID at service layer or direct query
      },
      data,
    });
  }

  async softDeleteUser(organizationId: string, id: string): Promise<User> {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restoreUser(organizationId: string, id: string): Promise<User> {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: null,
      },
    });
  }
}
