import { Request, Response, NextFunction } from 'express';
import { CycleCountService } from './cycle-count.service';
import { ResponseFormatter } from '../../common/responses';
import { UnauthorizedError } from '../../common/errors/app-error';

export class CycleCountController {
  private service = new CycleCountService();

  private getSessionContext(req: Request) {
    if (!req.workspace?.organizationId || !req.user?.id) {
      throw new UnauthorizedError('Tenant session context missing');
    }
    return { orgId: req.workspace.organizationId, userId: req.user.id };
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const result = await this.service.createCycleCount(orgId, userId, req.body);
      ResponseFormatter.success(res, 201, 'Cycle count created', result);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = this.getSessionContext(req);
      const result = await this.service.getCycleCounts(orgId);
      ResponseFormatter.success(res, 200, 'Cycle counts retrieved', result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId } = this.getSessionContext(req);
      const result = await this.service.getCycleCountById(orgId, req.params.id);
      ResponseFormatter.success(res, 200, 'Cycle count details retrieved', result);
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id, itemId } = req.params;
      const { actualQuantity, notes } = req.body;
      const result = await this.service.updateItemCount(orgId, userId, id, itemId, actualQuantity, notes);
      ResponseFormatter.success(res, 200, 'Item count updated', result);
    } catch (error) {
      next(error);
    }
  };

  complete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const result = await this.service.completeCycleCount(orgId, userId, req.params.id);
      ResponseFormatter.success(res, 200, 'Cycle count completed and inventory adjusted', result);
    } catch (error) {
      next(error);
    }
  };
}
