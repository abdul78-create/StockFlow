import prisma from '../../infra/database/prisma';
import { Prisma } from '@prisma/client';

export class SupplierRepository {
  async create(data: Prisma.SupplierUncheckedCreateInput) {
    return prisma.supplier.create({
      data,
    });
  }

  async findById(id: string, organizationId: string) {
    return prisma.supplier.findFirst({
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

    const where: Prisma.SupplierWhereInput = {
      organizationId,
      deletedAt: null,
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplier.count({ where }),
    ]);

    return { data, total };
  }

  async update(id: string, organizationId: string, data: Prisma.SupplierUncheckedUpdateInput) {
    return prisma.supplier.updateMany({
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
    return prisma.supplier.updateMany({
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
