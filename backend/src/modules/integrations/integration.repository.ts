import prisma from '../../infra/database/prisma';
import { Integration, Prisma } from '@prisma/client';

export class IntegrationRepository {
  async findByOrganization(organizationId: string): Promise<Integration[]> {
    return prisma.integration.findMany({
      where: { organizationId },
    });
  }

  async findByProvider(organizationId: string, provider: string): Promise<Integration | null> {
    return prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId,
          provider,
        },
      },
    });
  }

  async create(data: Prisma.IntegrationUncheckedCreateInput): Promise<Integration> {
    return prisma.integration.create({
      data,
    });
  }

  async update(id: string, data: Prisma.IntegrationUpdateInput): Promise<Integration> {
    return prisma.integration.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Integration> {
    return prisma.integration.delete({
      where: { id },
    });
  }
}
