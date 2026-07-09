import prisma from '../../infra/database/prisma';
import { User, Organization, AuthProvider } from '@prisma/client';

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
    passwordHash: string | null,
    firstName: string,
    lastName: string,
    provider: AuthProvider = AuthProvider.LOCAL,
    googleId?: string,
    avatar?: string,
  ) {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        provider,
        googleId,
        avatar,
      },
    });
  }

  async updateUserGoogle(
    userId: string,
    googleId: string,
    avatar?: string
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        ...(avatar ? { avatar } : {}),
        lastLogin: new Date(),
      }
    });
  }

  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
