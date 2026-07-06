import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CategoryValuation {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalQuantity: number;
  totalValuation: number;
}

export interface LowStockAlertItem {
  productId: string;
  sku: string;
  name: string;
  warehouseName: string;
  quantity: number;
  minimumStock: number;
}

export interface SalesSummaryItem {
  status: string;
  count: number;
  totalRevenue: number;
}

export interface FinancialSummary {
  totalAccountsReceivable: number;
  totalAccountsPayable: number;
  totalCashReceived: number;
  totalCashPaid: number;
  netCashFlow: number;
}

export function useInventoryValuation() {
  return useQuery({
    queryKey: ['reports', 'inventory-valuation'],
    queryFn: async () => {
      const response = await api.get('/reports/inventory-valuation');
      return response.data.data as CategoryValuation[];
    },
  });
}

export function useLowStockReport() {
  return useQuery({
    queryKey: ['reports', 'low-stock'],
    queryFn: async () => {
      const response = await api.get('/reports/low-stock');
      return response.data.data as LowStockAlertItem[];
    },
  });
}

export function useSalesSummary() {
  return useQuery({
    queryKey: ['reports', 'sales-summary'],
    queryFn: async () => {
      const response = await api.get('/reports/sales-summary');
      return response.data.data as SalesSummaryItem[];
    },
  });
}

export function usePurchaseSummary() {
  return useQuery({
    queryKey: ['reports', 'purchases'],
    queryFn: async () => {
      const response = await api.get('/reports/purchases');
      return response.data.data;
    },
  });
}

export function useFinancialSummary() {
  return useQuery({
    queryKey: ['reports', 'financial-summary'],
    queryFn: async () => {
      const response = await api.get('/reports/financial-summary');
      return response.data.data as FinancialSummary;
    },
  });
}

export interface ActivityLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export function useActivityLog(page: number = 1, limit: number = 25, entity?: string) {
  return useQuery({
    queryKey: ['reports', 'activity-log', page, limit, entity],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (entity) params.set('entity', entity);
      const response = await api.get(`/reports/activity-log?${params.toString()}`);
      return response.data.data as { logs: ActivityLogEntry[]; total: number };
    },
  });
}
