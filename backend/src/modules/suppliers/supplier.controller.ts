import { Request, Response, NextFunction } from 'express';
import { SupplierService } from './supplier.service';

export class SupplierController {
  private service: SupplierService;

  constructor() {
    this.service = new SupplierService();
  }

  createSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user!.organizationId;
      const supplier = await this.service.createSupplier({
        ...req.body,
        organizationId,
      });

      res.status(201).json({
        status: 'success',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };

  getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user!.organizationId;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = req.query.search as string;

      const result = await this.service.getSuppliers(organizationId, {
        page,
        limit,
        search,
      });

      res.status(200).json({
        status: 'success',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSupplierById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user!.organizationId;
      const id = req.params.id;

      const supplier = await this.service.getSupplierById(id, organizationId);

      res.status(200).json({
        status: 'success',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user!.organizationId;
      const id = req.params.id;

      const supplier = await this.service.updateSupplier(id, organizationId, req.body);

      res.status(200).json({
        status: 'success',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };
}
