import { Request, Response, NextFunction } from 'express';
import { BillingService } from './billing.service';
import { ResponseFormatter } from '../../common/responses';
import { UnauthorizedError } from '../../common/errors/app-error';
import { z } from 'zod';

const upgradeSchema = z.object({
  plan: z.enum(['PRO', 'ENTERPRISE']),
});

export class BillingController {
  private billingService: BillingService;

  constructor(billingService = new BillingService()) {
    this.billingService = billingService;
  }

  private getOrgId(req: Request): string {
    const orgId = req.workspace?.organizationId;
    if (!orgId) {
      throw new UnauthorizedError('Organization context missing');
    }
    return orgId;
  }

  getSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = this.getOrgId(req);
      const subscription = await this.billingService.getSubscription(orgId);
      ResponseFormatter.success(res, 200, 'Subscription fetched successfully', subscription);
    } catch (error) {
      next(error);
    }
  };

  upgradeSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = this.getOrgId(req);
      const userId = (req as any).user.id;
      const parsedBody = upgradeSchema.parse(req.body);
      
      const subscription = await this.billingService.upgradePlan(orgId, userId, parsedBody.plan as any);
      ResponseFormatter.success(res, 200, 'Subscription upgraded successfully', subscription);
    } catch (error) {
      next(error);
    }
  };
}
