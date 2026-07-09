import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  stockValue: number;
}

export interface RecentCustomer {
  id: string;
  name: string;
  email: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalSalesOrders: number;
  totalPurchaseOrders: number;
  pendingSalesOrders: number;
  pendingPurchaseOrders: number;
  revenue: number;
  expenses: number;
  profit: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  monthlyTransactionsCount: number;
  dailyTransactions: { date: string; transactions: number; revenue: number; expenses: number }[];
  recentActivity: {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    details: string | null;
    createdAt: string;
    userId: string;
  }[];
  topProducts: TopProduct[];
  recentCustomers: RecentCustomer[];
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data.data as DashboardMetrics;
    },
    staleTime: 60_000, // 1 minute cache
    refetchOnWindowFocus: false,
  });
}
