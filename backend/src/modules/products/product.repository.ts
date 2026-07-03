import prisma from '../../infra/database/prisma';
import { Product, Prisma } from '@prisma/client';
import { CreateProductInput, UpdateProductInput } from './product.validation';

export interface ProductFilters {
  categoryId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class ProductRepository {
  async findAll(
    organizationId: string,
    filters: ProductFilters,
  ): Promise<{ products: Product[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProductWhereInput = {
      organizationId,
      deletedAt: null, // respect soft delete
    };

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { barcode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          images: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    return { products, total };
  }

  async findById(organizationId: string, id: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        category: true,
        images: true,
        variants: true,
        units: true,
        suppliers: {
          include: {
            supplier: true,
          }
        },
        notes: true,
        attachments: true,
        inventories: {
          include: {
            warehouse: true,
            variant: true,
          },
        },
      },
    });
  }

  async findBySku(organizationId: string, sku: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        sku,
        organizationId,
        deletedAt: null,
      },
    });
  }

  async create(organizationId: string, input: CreateProductInput): Promise<Product> {
    return prisma.product.create({
      data: {
        sku: input.sku,
        barcode: input.barcode,
        name: input.name,
        description: input.description,
        costPrice: input.costPrice,
        sellingPrice: input.sellingPrice,
        taxRate: input.taxRate,
        weight: input.weight,
        minimumStock: input.minimumStock,
        maximumStock: input.maximumStock,
        imageUrl: input.imageUrl,
        status: input.status,
        qrCode: input.qrCode,
        hasVariants: input.hasVariants,
        baseUnit: input.baseUnit,
        organizationId,
        categoryId: input.categoryId,
      },
    });
  }

  async update(organizationId: string, id: string, input: UpdateProductInput): Promise<Product> {
    return prisma.product.update({
      where: {
        id,
        organizationId, // verify tenant bounds
      },
      data: {
        sku: input.sku,
        barcode: input.barcode,
        name: input.name,
        description: input.description,
        costPrice: input.costPrice,
        sellingPrice: input.sellingPrice,
        taxRate: input.taxRate,
        weight: input.weight,
        minimumStock: input.minimumStock,
        maximumStock: input.maximumStock,
        imageUrl: input.imageUrl,
        status: input.status,
        qrCode: input.qrCode,
        hasVariants: input.hasVariants,
        baseUnit: input.baseUnit,
        categoryId: input.categoryId,
      },
    });
  }

  async softDelete(organizationId: string, id: string): Promise<Product> {
    return prisma.product.update({
      where: {
        id,
        organizationId,
      },
      data: {
        status: 'ARCHIVED',
        deletedAt: new Date(),
      },
    });
  }

  async restore(organizationId: string, id: string): Promise<Product> {
    return prisma.product.update({
      where: {
        id,
        organizationId,
      },
      data: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
  }
}
