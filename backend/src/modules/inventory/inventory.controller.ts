import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { ResponseFormatter } from '../../common/responses';
import { parseQueryParams } from '../../common/utils/query';
import { UnauthorizedError } from '../../common/errors/app-error';
import { TransactionType } from '@prisma/client';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor(inventoryService = new InventoryService()) {
    this.inventoryService = inventoryService;
  }

  private getSessionContext(req: Request): { orgId: string; userId: string } {
    if (!req.user?.organizationId || !req.user?.id) {
      throw new UnauthorizedError('Tenant session context missing');
    }
    return { orgId: req.user.organizationId, userId: req.user.id };
  }

  getBalances = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const query = parseQueryParams(req, 'product.name');
      const { categoryId } = req.query;

      const result = await this.inventoryService.getBalances(orgId, query, categoryId as string);
      ResponseFormatter.success(
        res,
        200,
        'Inventory stock balances retrieved successfully',
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const query = parseQueryParams(req, 'createdAt');
      const { type } = req.query;

      const result = await this.inventoryService.getTransactionHistory(
        orgId,
        query,
        type as TransactionType,
      );
      ResponseFormatter.success(
        res,
        200,
        'Stock transactions history retrieved successfully',
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  adjust = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const transaction = await this.inventoryService.adjustStock(orgId, userId, req.body);
      ResponseFormatter.success(res, 200, 'Inventory stock adjusted successfully', transaction);
    } catch (error) {
      next(error);
    }
  };

  receive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const transaction = await this.inventoryService.receiveStock(orgId, userId, req.body);
      ResponseFormatter.success(res, 200, 'Inventory stock received successfully', transaction);
    } catch (error) {
      next(error);
    }
  };

  dispatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const transaction = await this.inventoryService.dispatchStock(orgId, userId, req.body);
      ResponseFormatter.success(res, 200, 'Inventory stock dispatched successfully', transaction);
    } catch (error) {
      next(error);
    }
  };

  transfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const transactions = await this.inventoryService.transferStock(orgId, userId, req.body);
      ResponseFormatter.success(res, 200, 'Inventory stock transferred successfully', transactions);
    } catch (error) {
      next(error);
    }
  };
}
