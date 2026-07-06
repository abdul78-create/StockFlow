import { TaxRuleRepository } from './tax-rule.repository';
import { NotFoundError } from '../../common/errors/app-error';
import { AuditService } from '../../common/services/audit.service';

export class TaxRuleService {
  private repo = new TaxRuleRepository();

  async getAll(organizationId: string) {
    return this.repo.findAll(organizationId);
  }

  async getById(id: string, organizationId: string) {
    const rule = await this.repo.findById(id, organizationId);
    if (!rule) throw new NotFoundError('Tax rule not found');
    return rule;
  }

  async create(organizationId: string, userId: string, data: { name: string; taxType: string; rate: number; isDefault?: boolean }) {
    if (data.isDefault) {
      await this.repo.clearDefault(organizationId);
    }
    const rule = await this.repo.create({ organizationId, name: data.name, taxType: data.taxType, rate: data.rate, isDefault: data.isDefault ?? false });
    await AuditService.log(organizationId, userId, 'TAX_RULE_CREATED', 'TaxRule', rule.id, { name: rule.name });
    return rule;
  }

  async update(id: string, organizationId: string, userId: string, data: { name?: string; taxType?: string; rate?: number; isDefault?: boolean }) {
    await this.getById(id, organizationId);
    if (data.isDefault) {
      await this.repo.clearDefault(organizationId);
    }
    const rule = await this.repo.update(id, data);
    await AuditService.log(organizationId, userId, 'TAX_RULE_UPDATED', 'TaxRule', rule.id, { name: rule.name });
    return rule;
  }

  async delete(id: string, organizationId: string, userId: string) {
    await this.getById(id, organizationId);
    await this.repo.delete(id);
    await AuditService.log(organizationId, userId, 'TAX_RULE_DELETED', 'TaxRule', id, {});
  }
}
