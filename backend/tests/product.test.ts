/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '../src/modules/products/product.service';
import { ProductRepository } from '../src/modules/products/product.repository';
import { ConflictError, NotFoundError, ValidationError } from '../src/common/errors/app-error';
import prisma from '../src/infra/database/prisma';

// Mock dependencies
vi.mock('../src/infra/database/prisma', () => ({
  default: {
    category: {
      findFirst: vi.fn(),
    },
    supplier: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('../src/modules/products/product.repository', () => {
  return {
    ProductRepository: vi.fn().mockImplementation(() => ({
      findAll: vi.fn(),
      findById: vi.fn(),
      findBySku: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
    })),
  };
});

describe('ProductService Unit Tests', () => {
  let productService: ProductService;
  let mockRepo: any;
  const orgId = 'org-uuid-1234';

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = new ProductRepository();
    productService = new ProductService(mockRepo);
  });

  describe('createProduct', () => {
    const createInput = {
      sku: 'PROD-001',
      name: 'Test Product',
      costPrice: 50.0,
      sellingPrice: 75.0,
      categoryId: 'cat-uuid-123',
      taxRate: 5.0,
      minimumStock: 5,
      maximumStock: 100,
    };

    it('should throw ConflictError if SKU already exists inside the organization', async () => {
      // Mock existing SKU
      mockRepo.findBySku.mockResolvedValue({ id: 'existing-prod-id', sku: 'PROD-001' });

      await expect(
        productService.createProduct(orgId, 'mock-user-uuid', createInput),
      ).rejects.toThrow(ConflictError);
      expect(mockRepo.findBySku).toHaveBeenCalledWith(orgId, 'PROD-001');
    });

    it('should throw NotFoundError if category does not exist', async () => {
      mockRepo.findBySku.mockResolvedValue(null);
      // Mock category lookup returning null
      (prisma.category.findFirst as any).mockResolvedValue(null);

      await expect(
        productService.createProduct(orgId, 'mock-user-uuid', createInput),
      ).rejects.toThrow(NotFoundError);
    });

    it('should create product successfully if parameters are valid', async () => {
      mockRepo.findBySku.mockResolvedValue(null);
      (prisma.category.findFirst as any).mockResolvedValue({
        id: 'cat-uuid-123',
        organizationId: orgId,
      });
      mockRepo.create.mockResolvedValue({
        ...createInput,
        id: 'new-prod-id',
        organizationId: orgId,
      });

      const result = await productService.createProduct(orgId, 'mock-user-uuid', createInput);

      expect(result).toHaveProperty('id', 'new-prod-id');
      expect(mockRepo.create).toHaveBeenCalledWith(orgId, createInput);
    });
  });

  describe('updateProduct', () => {
    const existingProduct: any = {
      id: 'prod-uuid-123',
      sku: 'PROD-001',
      name: 'Existing Product',
      costPrice: 50.0,
      sellingPrice: 75.0,
      categoryId: 'cat-uuid-123',
      organizationId: orgId,
    };

    it('should throw ValidationError if updated selling price is less than cost price', async () => {
      mockRepo.findById.mockResolvedValue(existingProduct);
      (prisma.category.findFirst as any).mockResolvedValue({ id: 'cat-uuid-123' });

      const updateInput = {
        sellingPrice: 40.0, // less than costPrice of 50.00
      };

      await expect(
        productService.updateProduct(orgId, 'prod-uuid-123', 'mock-user-uuid', updateInput),
      ).rejects.toThrow(ValidationError);
    });

    it('should successfully update product parameters if valid', async () => {
      mockRepo.findById.mockResolvedValue(existingProduct);
      (prisma.category.findFirst as any).mockResolvedValue({ id: 'cat-uuid-123' });
      mockRepo.update.mockResolvedValue({ ...existingProduct, name: 'Updated Name' });

      const result = await productService.updateProduct(orgId, 'prod-uuid-123', 'mock-user-uuid', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
      expect(mockRepo.update).toHaveBeenCalled();
    });
  });
});
