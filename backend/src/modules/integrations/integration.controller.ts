import { Request, Response, NextFunction } from 'express';
import { IntegrationService } from './integration.service';
import { ResponseFormatter } from '../../common/responses';
import { createIntegrationSchema, updateIntegrationSchema } from './integration.schema';

export class IntegrationController {
  private service: IntegrationService;

  constructor() {
    this.service = new IntegrationService();
  }

  getIntegrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const integrations = await this.service.getIntegrations(req.workspace!.organizationId);
      ResponseFormatter.success(res, 200, 'Integrations retrieved successfully', integrations);
    } catch (error) {
      next(error);
    }
  };

  setupIntegration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createIntegrationSchema.parse(req.body);
      const integration = await this.service.setupIntegration(req.workspace!.organizationId, req.user!.id, data);
      ResponseFormatter.success(res, 201, 'Integration setup successfully', integration);
    } catch (error) {
      next(error);
    }
  };

  updateIntegration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { provider } = req.params;
      const data = updateIntegrationSchema.parse(req.body);
      const integration = await this.service.updateIntegration(req.workspace!.organizationId, provider, req.user!.id, data);
      ResponseFormatter.success(res, 200, 'Integration updated successfully', integration);
    } catch (error) {
      next(error);
    }
  };

  removeIntegration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { provider } = req.params;
      await this.service.removeIntegration(req.workspace!.organizationId, provider, req.user!.id);
      ResponseFormatter.success(res, 200, 'Integration removed successfully', null);
    } catch (error) {
      next(error);
    }
  };
}
