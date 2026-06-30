import { WarehouseRepository } from './warehouse.repository';
import { NotFoundError } from '../../common/errors/app-error';
import logger from '../../infra/logger';

export class WarehouseService {
  private repository: WarehouseRepository;

  constructor() {
    this.repository = new WarehouseRepository();
  }

  async createWarehouse(data: {
    name: string;
    address?: string;
    organizationId: string;
  }) {
    logger.info({ organizationId: data.organizationId }, 'Creating new warehouse');
    return this.repository.create(data);
  }

  async getWarehouses(
    organizationId: string,
    params: { search?: string; page?: number; limit?: number },
  ) {
    const page = params.page || 1;
    const limit = params.limit || 50; // Warehouses usually need larger limits
    
    return this.repository.findMany(organizationId, { search: params.search, page, limit });
  }

  async getWarehouseById(id: string, organizationId: string) {
    const warehouse = await this.repository.findById(id, organizationId);
    if (!warehouse) {
      throw new NotFoundError('Warehouse not found');
    }
    return warehouse;
  }

  async updateWarehouse(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      address?: string;
    },
  ) {
    logger.info({ warehouseId: id }, 'Updating warehouse');
    
    const warehouse = await this.repository.findById(id, organizationId);
    if (!warehouse) {
      throw new NotFoundError('Warehouse not found');
    }

    await this.repository.update(id, organizationId, data);
    return this.repository.findById(id, organizationId);
  }

  async deleteWarehouse(id: string, organizationId: string) {
    logger.info({ warehouseId: id }, 'Soft deleting warehouse');
    
    const warehouse = await this.repository.findById(id, organizationId);
    if (!warehouse) {
      throw new NotFoundError('Warehouse not found');
    }

    await this.repository.softDelete(id, organizationId);
    return true;
  }
}
