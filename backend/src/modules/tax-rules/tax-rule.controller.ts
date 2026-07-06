import { Request, Response, NextFunction } from 'express';
import { TaxRuleService } from './tax-rule.service';
import { ResponseFormatter } from '../../common/responses';
import { createTaxRuleSchema, updateTaxRuleSchema } from './tax-rule.schema';

const service = new TaxRuleService();

export const getTaxRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getAll(req.workspace!.organizationId);
    ResponseFormatter.success(res, 200, 'Tax rules retrieved', data);
  } catch (e) { next(e); }
};

export const getTaxRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getById(req.params.id, req.workspace!.organizationId);
    ResponseFormatter.success(res, 200, 'Tax rule retrieved', data);
  } catch (e) { next(e); }
};

export const createTaxRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createTaxRuleSchema.parse(req.body);
    const data = await service.create(req.workspace!.organizationId, req.user!.id, body);
    ResponseFormatter.success(res, 201, 'Tax rule created', data);
  } catch (e) { next(e); }
};

export const updateTaxRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateTaxRuleSchema.parse(req.body);
    const data = await service.update(req.params.id, req.workspace!.organizationId, req.user!.id, body);
    ResponseFormatter.success(res, 200, 'Tax rule updated', data);
  } catch (e) { next(e); }
};

export const deleteTaxRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id, req.workspace!.organizationId, req.user!.id);
    ResponseFormatter.success(res, 200, 'Tax rule deleted', null);
  } catch (e) { next(e); }
};
