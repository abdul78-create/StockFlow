import prisma from '../../infra/database/prisma';
import { User, Organization } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null, // respect soft delete
      },
      include: {
        organization: true,
      },
    });
  }

  async createUserWithOrganization(
    email: string,
    passwordHash: string,
    role: string,
    organizationName: string,
    firstName: string,
    lastName: string,
  ): Promise<{ user: User; organization: Organization }> {
    return prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const org = await tx.organization.create({
        data: {
          name: organizationName,
          slug: slug || `org-${Date.now()}`,
        },
      });

      // 2. Create User linked to the organization
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
          firstName,
          lastName,
          organizationId: org.id,
        },
      });

      return { user, organization: org };
    });
  }
}
