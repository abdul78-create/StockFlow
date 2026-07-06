import { Request, Response, NextFunction } from 'express';
import { SalesOrderService } from './sales-order.service';
import { ResponseFormatter } from '../../common/responses';
import { parseQueryParams } from '../../common/utils/query';
import { UnauthorizedError } from '../../common/errors/app-error';
import { SalesOrderStatus } from '@prisma/client';

export class SalesOrderController {
  private soService: SalesOrderService;

  constructor(soService = new SalesOrderService()) {
    this.soService = soService;
  }

  private getSessionContext(req: Request): { orgId: string; userId: string } {
    if (!req.workspace?.organizationId || !req.user?.id) {
      throw new UnauthorizedError('Tenant session context missing');
    }
    return { orgId: req.workspace.organizationId, userId: req.user.id };
  }

  getSalesOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const query = parseQueryParams(req, 'createdAt');
      const { status, customerId } = req.query;

      const result = await this.soService.getSalesOrders(orgId, query, status as SalesOrderStatus, customerId as string);
      ResponseFormatter.success(res, 200, 'Sales Orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  };

  getSalesOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { id } = req.params;
      const order = await this.soService.getSalesOrderById(orgId, id);
      ResponseFormatter.success(res, 200, 'Sales Order retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  };

  createSalesOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const order = await this.soService.createSalesOrder(orgId, userId, req.body);
      ResponseFormatter.success(res, 201, 'Sales Order created successfully', order);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      const { status, warehouseId } = req.body;
      const order = await this.soService.updateSOStatus(orgId, id, userId, status, warehouseId);
      ResponseFormatter.success(res, 200, 'Sales Order status updated successfully', order);
    } catch (error) {
      next(error);
    }
  };

  dispatchOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      const order = await this.soService.dispatchOrder(orgId, id, userId, req.body);
      ResponseFormatter.success(
        res,
        200,
        'Sales Order dispatched and inventory updated successfully',
        order,
      );
    } catch (error) {
      next(error);
    }
  };
}
