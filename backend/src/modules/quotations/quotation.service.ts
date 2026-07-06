import { QuotationRepository } from './quotation.repository';
import { NotFoundError, ValidationError } from '../../common/errors/app-error';
import { AuditService } from '../../common/services/audit.service';
import { NotificationService } from '../notifications/notification.service';
import { CreateQuotationInput } from './quotation.schema';
import prisma from '../../infra/database/prisma';

export class QuotationService {
  private repo = new QuotationRepository();

  async getAll(organizationId: string, page?: number, limit?: number) {
    return this.repo.findAll(organizationId, page, limit);
  }

  async getById(id: string, organizationId: string) {
    const q = await this.repo.findById(id, organizationId);
    if (!q) throw new NotFoundError('Quotation not found');
    return q;
  }

  async create(organizationId: string, userId: string, input: CreateQuotationInput) {
    const subtotal = input.items.reduce((sum, i) => sum + i.quantity * i.unitPrice - i.discount, 0);
    const totalAmount = subtotal - (input.discountAmount || 0);
    const quoteNumber = await this.repo.getNextQuoteNumber(organizationId);

    const q = await this.repo.create({
      organizationId,
      quoteNumber,
      customerId: input.customerId,
      validUntil: input.validUntil,
      notes: input.notes,
      discountAmount: input.discountAmount || 0,
      taxAmount: 0, // applied at line level optionally
      totalAmount,
      createdBy: userId,
      items: input.items.map(i => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: i.discount || 0,
        totalAmount: i.quantity * i.unitPrice - (i.discount || 0),
      })),
    });

    await AuditService.log(organizationId, userId, 'QUOTATION_CREATED', 'Quotation', q.id, { quoteNumber });
    return q;
  }

  async updateStatus(id: string, organizationId: string, userId: string, status: string) {
    const q = await this.getById(id, organizationId);
    if (q.status === 'ACCEPTED' || q.status === 'EXPIRED') {
      throw new ValidationError(`Cannot update a ${q.status} quotation`);
    }

    const updated = await this.repo.updateStatus(id, status);
    await AuditService.log(organizationId, userId, 'QUOTATION_STATUS_UPDATED', 'Quotation', id, { status });

    if (status === 'ACCEPTED') {
      await NotificationService.createForAllMembers(
        organizationId,
        'QUOTE_ACCEPTED',
        'Quotation Accepted',
        `Quotation ${q.quoteNumber} has been accepted by ${q.customer.name}.`,
        'Quotation',
        id,
      );
    }
    return updated;
  }

  async convertToSalesOrder(id: string, organizationId: string, userId: string) {
    const q = await this.getById(id, organizationId);
    if (q.status !== 'ACCEPTED') throw new ValidationError('Only ACCEPTED quotations can be converted to sales orders');
    if (q.convertedToSoId) throw new ValidationError('Quotation already converted to a sales order');

    // Get next SO number
    const soCount = await prisma.salesOrder.count({ where: { organizationId } });
    const soNumber = `SO-${String(soCount + 1).padStart(4, '0')}`;

    const so = await prisma.salesOrder.create({
      data: {
        organizationId,
        soNumber,
        customerId: q.customerId,
        status: 'DRAFT',
        totalAmount: q.totalAmount,
        discountAmount: q.discountAmount,
        taxAmount: q.taxAmount,
        notes: `Converted from Quotation ${q.quoteNumber}`,
        items: {
          create: q.items.map(i => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
    });

    await this.repo.updateStatus(id, 'ACCEPTED', so.id);
    await AuditService.log(organizationId, userId, 'QUOTATION_CONVERTED', 'Quotation', id, { soNumber });
    return so;
  }

  async expireOverdue() {
    return this.repo.expireOverdue();
  }
}
