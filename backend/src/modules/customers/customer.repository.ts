import prisma from '../../infra/database/prisma';
import { Customer, Prisma } from '@prisma/client';
import { ParsedQuery } from '../../common/utils/query';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.validation';

export class CustomerRepository {
  async findAll(
    organizationId: string,
    query: ParsedQuery,
  ): Promise<{ customers: Customer[]; total: number }> {
    const whereClause: Prisma.CustomerWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (query.search) {
      whereClause.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where: whereClause,
        orderBy: { name: query.order },
        skip: query.skip,
        take: query.limit,
      }),
      prisma.customer.count({ where: whereClause }),
    ]);

    return { customers, total };
  }

  async findById(organizationId: string, id: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });
  }

  async create(organizationId: string, input: CreateCustomerInput): Promise<Customer> {
    return prisma.customer.create({
      data: {
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        gst: input.gst || null,
        address: input.address || null,
        organizationId,
      },
    });
  }

  async update(organizationId: string, id: string, input: UpdateCustomerInput): Promise<Customer> {
    return prisma.customer.update({
      where: {
        id,
        organizationId,
      },
      data: {
        name: input.name,
        email: input.email === '' ? null : input.email,
        phone: input.phone === '' ? null : input.phone,
        gst: input.gst === '' ? null : input.gst,
        address: input.address === '' ? null : input.address,
      },
    });
  }

  async softDelete(organizationId: string, id: string): Promise<Customer> {
    return prisma.customer.update({
      where: {
        id,
        organizationId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restore(organizationId: string, id: string): Promise<Customer> {
    return prisma.customer.update({
      where: {
        id,
        organizationId,
      },
      data: {
        deletedAt: null,
      },
    });
  }
}
