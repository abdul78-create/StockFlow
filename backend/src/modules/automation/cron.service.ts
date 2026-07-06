import cron from 'node-cron';
import prisma from '../../infra/database/prisma';
import { AuditService } from '../../common/services/audit.service';
import { InvoiceStatus } from '@prisma/client';

export class CronService {
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;

    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
      console.log('[CronService] Running daily jobs...');
      await this.checkOverdueInvoices();
      await this.checkSubscriptions();
      await this.expireOverdueQuotations();
      console.log('[CronService] Daily jobs completed.');
    });

    this.isInitialized = true;
    console.log('[CronService] Initialized scheduled jobs.');
  }

  static async checkOverdueInvoices() {
    try {
      const now = new Date();
      // Find invoices where dueDate < now, status is SENT or PARTIAL
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          dueDate: { lt: now },
          status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL] },
          deletedAt: null
        }
      });

      for (const invoice of overdueInvoices) {
        // Log overdue alert
        await AuditService.log(
          invoice.organizationId,
          'SYSTEM',
          'INVOICE_OVERDUE',
          'Invoice',
          invoice.id,
          {
            invoiceNumber: invoice.invoiceNumber,
            dueDate: invoice.dueDate,
            balanceDue: invoice.balanceDue
          }
        );
      }
    } catch (error) {
      console.error('[CronService] checkOverdueInvoices failed:', error);
    }
  }

  static async checkSubscriptions() {
    try {
      const now = new Date();
      // Find subscriptions that have passed their currentPeriodEnd and are ACTIVE
      const expiredSubs = await prisma.subscription.findMany({
        where: {
          currentPeriodEnd: { lt: now },
          status: 'ACTIVE'
        }
      });

      for (const sub of expiredSubs) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'PAST_DUE' }
        });

        await AuditService.log(
          sub.organizationId,
          'SYSTEM',
          'SUBSCRIPTION_EXPIRED',
          'Subscription',
          sub.id,
          { plan: sub.plan, expiredAt: sub.currentPeriodEnd }
        );
      }
    } catch (error) {
      console.error('[CronService] checkSubscriptions failed:', error);
    }
  }

  static async expireOverdueQuotations() {
    try {
      const now = new Date();
      const result = await prisma.quotation.updateMany({
        where: { validUntil: { lt: now }, status: { in: ['DRAFT', 'SENT'] } },
        data: { status: 'EXPIRED' },
      });
      if (result.count > 0) {
        console.log(`[CronService] Expired ${result.count} overdue quotations.`);
      }
    } catch (error) {
      console.error('[CronService] expireOverdueQuotations failed:', error);
    }
  }
}
