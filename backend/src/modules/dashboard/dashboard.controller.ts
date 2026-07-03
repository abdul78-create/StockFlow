import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { ResponseFormatter } from '../../common/responses';
import { UnauthorizedError } from '../../common/errors/app-error';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor(dashboardService = new DashboardService()) {
    this.dashboardService = dashboardService;
  }

  getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.workspace?.organizationId;
      if (!orgId) {
        throw new UnauthorizedError('Organization context missing');
      }

      const metrics = await this.dashboardService.getMetrics(orgId);
      ResponseFormatter.success(res, 200, 'Dashboard statistics aggregated successfully', metrics);
    } catch (error) {
      next(error);
    }
  };
}
