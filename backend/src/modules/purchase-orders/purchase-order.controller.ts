import { Request, Response, NextFunction } from 'express';
import { PurchaseOrderService } from './purchase-order.service';
import { ResponseFormatter } from '../../common/responses';
import { parseQueryParams } from '../../common/utils/query';
import { UnauthorizedError } from '../../common/errors/app-error';
import { PurchaseOrderStatus } from '@prisma/client';

export class PurchaseOrderController {
  private poService: PurchaseOrderService;

  constructor(poService = new PurchaseOrderService()) {
    this.poService = poService;
  }

  private getSessionContext(req: Request): { orgId: string; userId: string } {
    if (!req.workspace?.organizationId || !req.user?.id) {
      throw new UnauthorizedError('Tenant session context missing');
    }
    return { orgId: req.workspace.organizationId, userId: req.user.id };
  }

  getPurchaseOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const query = parseQueryParams(req, 'createdAt');
      const { status, supplierId } = req.query;

      const result = await this.poService.getPurchaseOrders(
        orgId,
        query,
        status as PurchaseOrderStatus,
        supplierId as string,
      );
      ResponseFormatter.success(res, 200, 'Purchase Orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  };

  getPurchaseOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { id } = req.params;
      const order = await this.poService.getPurchaseOrderById(orgId, id);
      ResponseFormatter.success(res, 200, 'Purchase Order retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  };

  createPurchaseOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const order = await this.poService.createPurchaseOrder(orgId, userId, req.body);
      ResponseFormatter.success(res, 201, 'Purchase Order created successfully', order);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      const { status } = req.body;
      const order = await this.poService.updatePOStatus(orgId, id, userId, status);
      ResponseFormatter.success(res, 200, 'Purchase Order status updated successfully', order);
    } catch (error) {
      next(error);
    }
  };

  receiveGoods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      const order = await this.poService.receiveGoods(orgId, id, userId, req.body);
      ResponseFormatter.success(
        res,
        200,
        'Goods received and inventory levels updated successfully',
        order,
      );
    } catch (error) {
      next(error);
    }
  };
}
