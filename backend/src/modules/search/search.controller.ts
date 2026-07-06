import { Request, Response, NextFunction } from 'express';
import { ResponseFormatter } from '../../common/responses';
import prisma from '../../infra/database/prisma';

export const globalSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q || '').trim();
    const orgId = req.workspace!.organizationId;

    if (!q || q.length < 2) {
      ResponseFormatter.success(res, 200, 'Search results', { products: [], customers: [], suppliers: [], salesOrders: [], purchaseOrders: [], quotations: [] });
      return;
    }

    const contains = { contains: q, mode: 'insensitive' as const };

    const [products, customers, suppliers, salesOrders, purchaseOrders, quotations] = await Promise.all([
      prisma.product.findMany({
        where: { organizationId: orgId, deletedAt: null, OR: [{ name: contains }, { sku: contains }, { barcode: contains }] },
        select: { id: true, name: true, sku: true, barcode: true, imageUrl: true, sellingPrice: true },
        take: 5,
      }),
      prisma.customer.findMany({
        where: { organizationId: orgId, deletedAt: null, OR: [{ name: contains }, { email: contains }, { phone: contains }] },
        select: { id: true, name: true, email: true, phone: true },
        take: 5,
      }),
      prisma.supplier.findMany({
        where: { organizationId: orgId, deletedAt: null, OR: [{ companyName: contains }, { email: contains }] },
        select: { id: true, companyName: true, email: true },
        take: 5,
      }),
      prisma.salesOrder.findMany({
        where: { organizationId: orgId, deletedAt: null, soNumber: contains },
        select: { id: true, soNumber: true, status: true, totalAmount: true },
        take: 5,
      }),
      prisma.purchaseOrder.findMany({
        where: { organizationId: orgId, deletedAt: null, poNumber: contains },
        select: { id: true, poNumber: true, status: true, totalAmount: true },
        take: 5,
      }),
      prisma.quotation.findMany({
        where: { organizationId: orgId, deletedAt: null, quoteNumber: contains },
        select: { id: true, quoteNumber: true, status: true, totalAmount: true },
        take: 5,
      }),
    ]);

    ResponseFormatter.success(res, 200, 'Search results', { products, customers, suppliers, salesOrders, purchaseOrders, quotations });
  } catch (e) { next(e); }
};
