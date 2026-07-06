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
    if (!req.workspace?.organizationId || !req.user?.id) {
      throw new UnauthorizedError('Tenant session context missing');
    }
    return { orgId: req.workspace.organizationId, userId: req.user.id };
  }

  getBalances = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const query = parseQueryParams(req, 'product.name');
      const { categoryId, warehouseId } = req.query;

      const result = await this.inventoryService.getBalances(
        orgId,
        query,
        categoryId as string,
        warehouseId as string,
      );
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
      const { type, warehouseId } = req.query;

      const result = await this.inventoryService.getTransactionHistory(
        orgId,
        query,
        type as TransactionType,
        warehouseId as string,
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

  getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { warehouseId } = req.query;

      const result = await this.inventoryService.getHealth(orgId, warehouseId as string);
      ResponseFormatter.success(
        res,
        200,
        'Inventory health metrics retrieved successfully',
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

  getExpiring = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const days = req.query.days ? Number(req.query.days) : 30;
      const data = await this.inventoryService.getExpiringBatches(orgId, days);
      ResponseFormatter.success(res, 200, 'Expiring batches retrieved', data);
    } catch (error) {
      next(error);
    }
  };
}
