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
