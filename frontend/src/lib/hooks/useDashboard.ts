import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardMetrics {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  inventoryValue: number;
  lowStockCount: number;
  monthlyTransactionsCount: number;
  recentActivity: any[]; // Using any for AuditLog to avoid importing missing types
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data.data as DashboardMetrics;
    },
  });
}
