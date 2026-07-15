import { SupplierService } from './supplier.service';
import { SupplierRepository } from './supplier.repository';
import { AppError } from '../../common/errors/app-error';
import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';

// Mock the repository
vi.mock('./supplier.repository');

describe('SupplierService', () => {
  let service: SupplierService;
  let mockRepository: Mocked<SupplierRepository>;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Create new service instance
    service = new SupplierService();
    
    // Get the mocked instance injected into the service
    mockRepository = (service as unknown as { repository: Mocked<SupplierRepository> }).repository;
  });

  describe('createSupplier', () => {
    it('should successfully create a supplier', async () => {
      const mockData = {
        companyName: 'Test Supplier',
        organizationId: 'org-123',
      };
      
      const mockResponse = {
        id: 'supp-123',
        ...mockData,
        email: null,
        phone: null,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        gst: null,
        paymentTerms: null,
      };

      mockRepository.create.mockResolvedValue(mockResponse);

      const result = await service.createSupplier(mockData);
      
      expect(mockRepository.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSupplierById', () => {
    it('should return a supplier if found', async () => {
      const mockResponse = {
        id: 'supp-123',
        companyName: 'Test Supplier',
        organizationId: 'org-123',
        email: null,
        phone: null,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        gst: null,
        paymentTerms: null,
      };

      mockRepository.findById.mockResolvedValue(mockResponse);

      const result = await service.getSupplierById('supp-123', 'org-123');
      
      expect(mockRepository.findById).toHaveBeenCalledWith('supp-123', 'org-123');
      expect(result).toEqual(mockResponse);
    });

    it('should throw AppError if supplier not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getSupplierById('invalid-id', 'org-123'))
        .rejects
        .toThrow(AppError);
        
      await expect(service.getSupplierById('invalid-id', 'org-123'))
        .rejects
        .toMatchObject({ statusCode: 404 });
    });
  });
});
