import { SupplierRepository } from './supplier.repository';
import { NotFoundError } from '../../common/errors/app-error';
import logger from '../../infra/logger';
import prisma from '../../infra/database/prisma';

export class SupplierService {
  private repository: SupplierRepository;

  constructor() {
    this.repository = new SupplierRepository();
  }

  async createSupplier(data: {
    companyName: string;
    email?: string;
    phone?: string;
    address?: string;
    gst?: string;
    paymentTerms?: string;
    organizationId: string;
  }) {
    logger.info({ organizationId: data.organizationId }, 'Creating new supplier');
    return this.repository.create(data);
  }

  async getSuppliers(
    organizationId: string,
    params: { search?: string; page?: number; limit?: number },
  ) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    
    return this.repository.findMany(organizationId, { search: params.search, page, limit });
  }

  async getSupplierById(id: string, organizationId: string) {
    const supplier = await this.repository.findById(id, organizationId);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }
    return supplier;
  }

  async getSupplierStats(id: string, organizationId: string) {
    const supplier = await this.repository.findById(id, organizationId);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    const aggregations = await prisma.purchaseOrder.aggregate({
      where: {
        organizationId,
        supplierId: id,
        deletedAt: null,
      },
      _count: {
        id: true,
      },
      _max: {
        createdAt: true,
      },
    });

    const spendAggregations = await prisma.purchaseOrder.aggregate({
      where: {
        organizationId,
        supplierId: id,
        deletedAt: null,
        status: {
          not: 'CANCELLED',
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    return {
      totalOrders: aggregations._count.id,
      lastOrderDate: aggregations._max.createdAt,
      totalSpend: spendAggregations._sum.totalAmount || 0,
    };
  }

  async updateSupplier(
    id: string,
    organizationId: string,
    data: {
      companyName?: string;
      email?: string;
      phone?: string;
      address?: string;
      gst?: string;
      paymentTerms?: string;
    },
  ) {
    logger.info({ supplierId: id }, 'Updating supplier');
    
    // verify existence
    const supplier = await this.repository.findById(id, organizationId);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    await this.repository.update(id, organizationId, data);
    return this.repository.findById(id, organizationId);
  }

  async deleteSupplier(id: string, organizationId: string) {
    logger.info({ supplierId: id }, 'Soft deleting supplier');
    
    const supplier = await this.repository.findById(id, organizationId);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    await this.repository.softDelete(id, organizationId);
    return true;
  }
}
