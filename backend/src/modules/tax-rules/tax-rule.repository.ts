import prisma from '../../infra/database/prisma';
import { Prisma } from '@prisma/client';

export class TaxRuleRepository {
  async findAll(organizationId: string) {
    return prisma.taxRule.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string, organizationId: string) {
    return prisma.taxRule.findFirst({ where: { id, organizationId } });
  }

  async create(data: Prisma.TaxRuleUncheckedCreateInput) {
    return prisma.taxRule.create({ data });
  }

  async update(id: string, data: Prisma.TaxRuleUpdateInput) {
    return prisma.taxRule.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.taxRule.delete({ where: { id } });
  }

  async clearDefault(organizationId: string) {
    return prisma.taxRule.updateMany({ where: { organizationId, isDefault: true }, data: { isDefault: false } });
  }
}
