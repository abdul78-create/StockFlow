import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { ResponseFormatter } from '../../common/responses';
import { UnauthorizedError } from '../../common/errors/app-error';

export class ReportsController {
  private reportsService: ReportsService;

  constructor(reportsService = new ReportsService()) {
    this.reportsService = reportsService;
  }

  private getOrgId(req: Request): string {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      throw new UnauthorizedError('Organization context missing');
    }
    return orgId;
  }

  getValuationReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = this.getOrgId(req);
      const report = await this.reportsService.getInventoryValuationReport(orgId);
      ResponseFormatter.success(
        res,
        200,
        'Inventory valuation report generated successfully',
        report,
      );
    } catch (error) {
      next(error);
    }
  };

  getLowStockReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = this.getOrgId(req);
      const report = await this.reportsService.getLowStockReport(orgId);
      ResponseFormatter.success(res, 200, 'Low stock report generated successfully', report);
    } catch (error) {
      next(error);
    }
  };

  getSalesReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = this.getOrgId(req);
      const report = await this.reportsService.getSalesReport(orgId);
      ResponseFormatter.success(res, 200, 'Sales activity report generated successfully', report);
    } catch (error) {
      next(error);
    }
  };
}
