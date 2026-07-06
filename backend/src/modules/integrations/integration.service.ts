import { IntegrationRepository } from './integration.repository';
import { NotFoundError, ConflictError } from '../../common/errors/app-error';
import { AuditService } from '../../common/services/audit.service';
import crypto from 'crypto';
import { config } from '../../infra/config';
import { Prisma } from '@prisma/client';

export class IntegrationService {
  private repository: IntegrationRepository;
  
  // Use a derived 32-byte key from JWT_SECRET for simple symmetric encryption
  private encryptionKey: Buffer;

  constructor() {
    this.repository = new IntegrationRepository();
    this.encryptionKey = crypto.scryptSync(config.JWT_SECRET, 'salt', 32);
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  }

  async getIntegrations(organizationId: string) {
    const integrations = await this.repository.findByOrganization(organizationId);
    
    // Do not return raw config to frontend, just whether it is configured
    return integrations.map(i => ({
      id: i.id,
      provider: i.provider,
      category: i.category,
      status: i.status,
      updatedAt: i.updatedAt,
      isConfigured: !!i.config,
    }));
  }

  async getIntegrationDetails(organizationId: string, provider: string) {
    const integration = await this.repository.findByProvider(organizationId, provider);
    if (!integration) throw new NotFoundError('Integration not found');
    
    // Optionally return decrypted config if requested, but normally we just return status
    return {
      id: integration.id,
      provider: integration.provider,
      category: integration.category,
      status: integration.status,
      // For editing purposes we might need to return config, or just require them to overwrite it
      // Let's not return the actual API keys to the frontend for security.
      isConfigured: true
    };
  }

  async setupIntegration(organizationId: string, userId: string, data: { provider: string, category: string, config: string }) {
    // Check if already exists
    const existing = await this.repository.findByProvider(organizationId, data.provider);
    if (existing) {
      throw new ConflictError('Integration already exists. Update it instead.');
    }

    const encryptedConfig = this.encrypt(data.config);

    const integration = await this.repository.create({
      organizationId,
      provider: data.provider,
      category: data.category,
      config: encryptedConfig,
      status: 'ACTIVE',
    });

    await AuditService.log(
      organizationId,
      userId,
      'INTEGRATION_SETUP',
      'Integration',
      integration.id,
      { provider: integration.provider }
    );

    return {
      id: integration.id,
      provider: integration.provider,
      status: integration.status,
    };
  }

  async updateIntegration(organizationId: string, provider: string, userId: string, data: { status?: string, config?: string }) {
    const integration = await this.repository.findByProvider(organizationId, provider);
    if (!integration) throw new NotFoundError('Integration not found');

    const updateData: Prisma.IntegrationUpdateInput = {};
    if (data.status) updateData.status = data.status;
    if (data.config) updateData.config = this.encrypt(data.config);

    const updated = await this.repository.update(integration.id, updateData);

    await AuditService.log(
      organizationId,
      userId,
      'INTEGRATION_UPDATED',
      'Integration',
      integration.id,
      { provider: integration.provider, status: updated.status }
    );

    return {
      id: updated.id,
      provider: updated.provider,
      status: updated.status,
    };
  }

  async removeIntegration(organizationId: string, provider: string, userId: string) {
    const integration = await this.repository.findByProvider(organizationId, provider);
    if (!integration) throw new NotFoundError('Integration not found');

    await this.repository.delete(integration.id);

    await AuditService.log(
      organizationId,
      userId,
      'INTEGRATION_REMOVED',
      'Integration',
      integration.id,
      { provider: integration.provider }
    );
  }
}
