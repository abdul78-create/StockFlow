import { Request, Response, NextFunction } from 'express';
import { CronService } from './cron.service';
import { ResponseFormatter } from '../../common/responses';

export class AutomationController {
  triggerOverdueInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await CronService.checkOverdueInvoices();
      ResponseFormatter.success(res, 200, 'Overdue invoices check triggered successfully', null);
    } catch (error) {
      next(error);
    }
  };

  triggerSubscriptionsCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await CronService.checkSubscriptions();
      ResponseFormatter.success(res, 200, 'Subscriptions check triggered successfully', null);
    } catch (error) {
      next(error);
    }
  };
}
