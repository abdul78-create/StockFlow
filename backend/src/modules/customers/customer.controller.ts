import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { ResponseFormatter } from '../../common/responses';
import { parseQueryParams } from '../../common/utils/query';
import { UnauthorizedError } from '../../common/errors/app-error';

export class CustomerController {
  private customerService: CustomerService;

  constructor(customerService = new CustomerService()) {
    this.customerService = customerService;
  }

  private getSessionContext(req: Request): { orgId: string; userId: string } {
    if (!req.user?.organizationId || !req.user?.id) {
      throw new UnauthorizedError('Tenant session context missing');
    }
    return { orgId: req.user.organizationId, userId: req.user.id };
  }

  getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const query = parseQueryParams(req, 'name');

      const result = await this.customerService.getCustomers(orgId, query);
      ResponseFormatter.success(res, 200, 'Customers retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  };

  getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(orgId, id);
      ResponseFormatter.success(res, 200, 'Customer retrieved successfully', customer);
    } catch (error) {
      next(error);
    }
  };

  createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const customer = await this.customerService.createCustomer(orgId, userId, req.body);
      ResponseFormatter.success(res, 201, 'Customer created successfully', customer);
    } catch (error) {
      next(error);
    }
  };

  updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      const updated = await this.customerService.updateCustomer(orgId, id, userId, req.body);
      ResponseFormatter.success(res, 200, 'Customer updated successfully', updated);
    } catch (error) {
      next(error);
    }
  };

  deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      await this.customerService.deleteCustomer(orgId, id, userId);
      ResponseFormatter.success(res, 200, 'Customer deleted successfully', null);
    } catch (error) {
      next(error);
    }
  };

  restoreCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      const restored = await this.customerService.restoreCustomer(orgId, id, userId);
      ResponseFormatter.success(res, 200, 'Customer restored successfully', restored);
    } catch (error) {
      next(error);
    }
  };
}
