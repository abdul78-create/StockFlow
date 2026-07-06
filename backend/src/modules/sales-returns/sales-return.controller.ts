import { Request, Response, NextFunction } from 'express';
import { SalesReturnService } from './sales-return.service';
import { ResponseFormatter } from '../../common/responses';
import { createSalesReturnSchema } from './sales-return.schema';

const service = new SalesReturnService();

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const data = await service.getAll(req.workspace!.organizationId, page, limit);
    ResponseFormatter.success(res, 200, 'Sales returns retrieved', data);
  } catch (e) { next(e); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getById(req.params.id, req.workspace!.organizationId);
    ResponseFormatter.success(res, 200, 'Sales return retrieved', data);
  } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createSalesReturnSchema.parse(req.body);
    const data = await service.create(req.workspace!.organizationId, req.user!.id, body);
    ResponseFormatter.success(res, 201, 'Sales return created', data);
  } catch (e) { next(e); }
};

export const approve = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.approve(req.params.id, req.workspace!.organizationId, req.user!.id);
    ResponseFormatter.success(res, 200, 'Sales return approved', data);
  } catch (e) { next(e); }
};

export const cancel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.cancel(req.params.id, req.workspace!.organizationId, req.user!.id);
    ResponseFormatter.success(res, 200, 'Sales return cancelled', data);
  } catch (e) { next(e); }
};
