import prisma from '../../infra/database/prisma';
import logger from '../../infra/logger';

export class AuditService {
  static async log(
    organizationId: string,
    userId: string | null,
    action: string,
    entity: string,
    entityId: string | null,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    try {
      const stringifiedMetadata = JSON.stringify(metadata);

      await prisma.auditLog.create({
        data: {
          organizationId,
          userId,
          action,
          entity,
          entityId,
          metadata: stringifiedMetadata,
        },
      });

      logger.info(
        { organizationId, userId, action, entity, entityId, metadata },
        'Audit Trail Registered Successfully',
      );
    } catch (error) {
      // Don't throw errors from the Audit service to prevent blocking main business operations
      logger.error({ error, organizationId, userId, action, entity }, 'Failed to write Audit Log');
    }
  }
}
