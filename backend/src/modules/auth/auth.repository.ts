import prisma from '../../infra/database/prisma';
import { User, Organization } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        memberships: {
          include: {
            organization: true,
          }
        },
      },
    });
  }

  async createUser(
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
  ) {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
    });
  }
}
