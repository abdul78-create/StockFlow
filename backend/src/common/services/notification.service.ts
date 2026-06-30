import logger from '../../infra/logger';

export type NotificationEvent =
  | 'LOW_STOCK'
  | 'PURCHASE_APPROVED'
  | 'PURCHASE_COMPLETED'
  | 'SALES_COMPLETED'
  | 'PRODUCT_ARCHIVED'
  | 'USER_CREATED';

export interface NotificationPayload {
  recipientEmail?: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export class NotificationService {
  static async send(
    organizationId: string,
    event: NotificationEvent,
    payload: NotificationPayload,
  ): Promise<void> {
    // Current V1 implementation: Log to structured logs
    // Pluggable for future Email (SendGrid), SMS (Twilio), Slack webhooks
    logger.info(
      {
        organizationId,
        event,
        payload,
        timestamp: new Date().toISOString(),
      },
      `Notification Event Triggered: ${event} - ${payload.title}`,
    );

    // Simulated db notification log write can be placed here if needed
  }
}
