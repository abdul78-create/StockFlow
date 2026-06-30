import prisma from '../../infra/database/prisma';
import { Prisma } from '@prisma/client';

export class WarehouseRepository {
  async create(data: Prisma.WarehouseUncheckedCreateInput) {
    return prisma.warehouse.create({
      data,
    });
  }

  async findById(id: string, organizationId: string) {
    return prisma.warehouse.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });
  }

  async findMany(organizationId: string, params: { search?: string; page: number; limit: number }) {
    const { search, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.WarehouseWhereInput = {
      organizationId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.warehouse.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: string, organizationId: string, data: Prisma.WarehouseUncheckedUpdateInput) {
    return prisma.warehouse.updateMany({
      where: {
        id,
        organizationId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(id: string, organizationId: string) {
    return prisma.warehouse.updateMany({
      where: {
        id,
        organizationId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
