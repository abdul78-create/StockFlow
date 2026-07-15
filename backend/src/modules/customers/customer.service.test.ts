import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';
import { NotFoundError } from '../../common/errors/app-error';
import { AuditService } from '../../common/services/audit.service';
import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';

vi.mock('./customer.repository');
vi.mock('../../common/services/audit.service');

describe('CustomerService', () => {
  let service: CustomerService;
  let mockRepository: Mocked<CustomerRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CustomerService();
    mockRepository = (service as unknown as { customerRepository: Mocked<CustomerRepository> }).customerRepository;
  });

  describe('createCustomer', () => {
    it('should create a customer successfully and log audit', async () => {
      const mockInput = {
        name: 'Test Customer',
      };
      const mockResponse = {
        id: 'cust-1',
        ...mockInput,
        email: null,
        phone: null,
        gst: null,
        address: null,
        organizationId: 'org-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        creditLimit: null,
      };

      mockRepository.create.mockResolvedValue(mockResponse);
      (AuditService.log as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await service.createCustomer('org-1', 'user-1', mockInput);

      expect(mockRepository.create).toHaveBeenCalledWith('org-1', mockInput);
      expect(AuditService.log).toHaveBeenCalledWith(
        'org-1',
        'user-1',
        'CUSTOMER_CREATED',
        'Customer',
        'cust-1',
        { name: 'Test Customer' }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCustomerById', () => {
    it('should return the customer if found', async () => {
      const mockResponse = {
        id: 'cust-1',
        name: 'Test Customer',
        organizationId: 'org-1',
        email: null,
        phone: null,
        gst: null,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        creditLimit: null,
      };

      mockRepository.findById.mockResolvedValue(mockResponse);

      const result = await service.getCustomerById('org-1', 'cust-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('org-1', 'cust-1');
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundError if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getCustomerById('org-1', 'cust-1')).rejects.toThrow(NotFoundError);
      await expect(service.getCustomerById('org-1', 'cust-1')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
