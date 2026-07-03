import prisma from '../../infra/database/prisma';
import { Subscription } from '@prisma/client';
import { NotFoundError } from '../../common/errors/app-error';
import { AuditService } from '../../common/services/audit.service';

export class BillingService {
  async getSubscription(organizationId: string): Promise<Subscription> {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found for this organization');
    }

    return subscription;
  }

  async upgradePlan(organizationId: string, userId: string, plan: 'PRO' | 'ENTERPRISE'): Promise<Subscription> {
    const current = await this.getSubscription(organizationId);

    // Simulated Stripe integration logic would go here

    const updated = await prisma.subscription.update({
      where: { organizationId },
      data: {
        plan,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
    });

    await AuditService.log(
      organizationId,
      userId,
      'SUBSCRIPTION_UPGRADED',
      'Organization',
      organizationId,
      { previousPlan: current.plan, newPlan: plan }
    );

    return updated;
  }
}
