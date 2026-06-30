import prisma from '../../infra/database/prisma';
import { CustomerRepository } from './customer.repository';
import { NotFoundError } from '../../common/errors/app-error';
import { AuditService } from '../../common/services/audit.service';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.validation';
import { Customer } from '@prisma/client';
import { ParsedQuery } from '../../common/utils/query';

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor(customerRepository = new CustomerRepository()) {
    this.customerRepository = customerRepository;
  }

  async getCustomers(
    organizationId: string,
    query: ParsedQuery,
  ): Promise<{ customers: Customer[]; total: number }> {
    return this.customerRepository.findAll(organizationId, query);
  }

  async getCustomerById(organizationId: string, id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(organizationId, id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    return customer;
  }

  async createCustomer(
    organizationId: string,
    userId: string,
    input: CreateCustomerInput,
  ): Promise<Customer> {
    const customer = await this.customerRepository.create(organizationId, input);

    // Audit Log trigger
    await AuditService.log(organizationId, userId, 'CUSTOMER_CREATED', 'Customer', customer.id, {
      name: customer.name,
    });

    return customer;
  }

  async updateCustomer(
    organizationId: string,
    id: string,
    userId: string,
    input: UpdateCustomerInput,
  ): Promise<Customer> {
    const customer = await this.customerRepository.findById(organizationId, id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const updated = await this.customerRepository.update(organizationId, id, input);

    // Audit Log trigger
    await AuditService.log(organizationId, userId, 'CUSTOMER_UPDATED', 'Customer', updated.id, {
      changes: input,
    });

    return updated;
  }

  async deleteCustomer(organizationId: string, id: string, userId: string): Promise<void> {
    const customer = await this.customerRepository.findById(organizationId, id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    await this.customerRepository.softDelete(organizationId, id);

    // Audit Log trigger
    await AuditService.log(organizationId, userId, 'CUSTOMER_DELETED', 'Customer', id);
  }

  async restoreCustomer(organizationId: string, id: string, userId: string): Promise<Customer> {
    const customer = await prisma.customer.findFirst({
      where: { id, organizationId, deletedAt: { not: null } },
    });
    if (!customer) {
      throw new NotFoundError('Archived customer not found');
    }

    const restored = await this.customerRepository.restore(organizationId, id);

    // Audit Log trigger
    await AuditService.log(organizationId, userId, 'CUSTOMER_RESTORED', 'Customer', id);

    return restored;
  }
}
