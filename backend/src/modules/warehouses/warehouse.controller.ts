import { Request, Response, NextFunction } from 'express';
import { WarehouseService } from './warehouse.service';

export class WarehouseController {
  private service: WarehouseService;

  constructor() {
    this.service = new WarehouseService();
  }

  createWarehouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user!.organizationId;
      const warehouse = await this.service.createWarehouse({
        ...req.body,
        organizationId,
      });

      res.status(201).json({
        status: 'success',
        data: warehouse,
      });
    } catch (error) {
      next(error);
    }
  };

  getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user!.organizationId;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const search = req.query.search as string;

      const result = await this.service.getWarehouses(organizationId, {
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

  getWarehouseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user!.organizationId;
      const id = req.params.id;

      const warehouse = await this.service.getWarehouseById(id, organizationId);

      res.status(200).json({
        status: 'success',
        data: warehouse,
      });
    } catch (error) {
      next(error);
    }
  };

  updateWarehouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user!.organizationId;
      const id = req.params.id;

      const warehouse = await this.service.updateWarehouse(id, organizationId, req.body);

      res.status(200).json({
        status: 'success',
        data: warehouse,
      });
    } catch (error) {
      next(error);
    }
  };
}
