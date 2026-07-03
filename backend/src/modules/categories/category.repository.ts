import { PrismaClient, Category } from '@prisma/client';
import { CreateCategoryInput, UpdateCategoryInput } from './category.validation';

const prisma = new PrismaClient();

export class CategoryRepository {
  async findMany(organizationId: string) {
    return prisma.category.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, organizationId: string) {
    return prisma.category.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  async create(organizationId: string, data: CreateCategoryInput) {
    return prisma.category.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  async update(id: string, organizationId: string, data: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
