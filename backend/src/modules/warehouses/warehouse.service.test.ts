import { WarehouseService } from './warehouse.service';
import { WarehouseRepository } from './warehouse.repository';
import { AppError } from '../../common/errors/app-error';
import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';

// Mock the repository
vi.mock('./warehouse.repository');

describe('WarehouseService', () => {
  let service: WarehouseService;
  let mockRepository: Mocked<WarehouseRepository>;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Create new service instance
    service = new WarehouseService();
    
    // Get the mocked instance injected into the service
    mockRepository = (service as unknown as { repository: Mocked<WarehouseRepository> }).repository;
  });

  describe('createWarehouse', () => {
    it('should successfully create a warehouse', async () => {
      const mockData = {
        name: 'Main Distribution Center',
        organizationId: 'org-123',
      };
      
      const mockResponse = {
        id: 'wh-123',
        ...mockData,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.create.mockResolvedValue(mockResponse);

      const result = await service.createWarehouse(mockData);
      
      expect(mockRepository.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getWarehouseById', () => {
    it('should return a warehouse if found', async () => {
      const mockResponse = {
        id: 'wh-123',
        name: 'Main Warehouse',
        organizationId: 'org-123',
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockRepository.findById.mockResolvedValue(mockResponse);

      const result = await service.getWarehouseById('wh-123', 'org-123');
      
      expect(mockRepository.findById).toHaveBeenCalledWith('wh-123', 'org-123');
      expect(result).toEqual(mockResponse);
    });

    it('should throw AppError if warehouse not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getWarehouseById('invalid-id', 'org-123'))
        .rejects
        .toThrow(AppError);
        
      await expect(service.getWarehouseById('invalid-id', 'org-123'))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });
  });
});
