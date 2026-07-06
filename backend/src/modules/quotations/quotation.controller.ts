import { Request, Response, NextFunction } from 'express';
import { QuotationService } from './quotation.service';
import { ResponseFormatter } from '../../common/responses';
import { createQuotationSchema, updateQuotationStatusSchema } from './quotation.schema';

const service = new QuotationService();

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const data = await service.getAll(req.workspace!.organizationId, page, limit);
    ResponseFormatter.success(res, 200, 'Quotations retrieved', data);
  } catch (e) { next(e); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getById(req.params.id, req.workspace!.organizationId);
    ResponseFormatter.success(res, 200, 'Quotation retrieved', data);
  } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createQuotationSchema.parse(req.body);
    const data = await service.create(req.workspace!.organizationId, req.user!.id, body);
    ResponseFormatter.success(res, 201, 'Quotation created', data);
  } catch (e) { next(e); }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = updateQuotationStatusSchema.parse(req.body);
    const data = await service.updateStatus(req.params.id, req.workspace!.organizationId, req.user!.id, status);
    ResponseFormatter.success(res, 200, 'Quotation status updated', data);
  } catch (e) { next(e); }
};

export const convertToOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const so = await service.convertToSalesOrder(req.params.id, req.workspace!.organizationId, req.user!.id);
    ResponseFormatter.success(res, 201, 'Quotation converted to sales order', so);
  } catch (e) { next(e); }
};
