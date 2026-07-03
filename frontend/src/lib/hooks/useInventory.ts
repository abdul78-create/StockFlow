import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  PaginatedBalances, 
  PaginatedHistory, 
  Warehouse, 
  StockHealth 
} from '../types/inventory';

export function useInventoryBalances(params: {
  warehouseId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['inventory', 'balances', params],
    queryFn: async () => {
      const response = await api.get('/inventory/balances', { params });
      const data = response.data.data;
      return {
        data: data.balances || [],
        total: data.total || 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil((data.total || 0) / (params.limit || 10))
      } as PaginatedBalances;
    },
  });
}

export function useInventoryHistory(params: {
  warehouseId?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['inventory', 'history', params],
    queryFn: async () => {
      const response = await api.get('/inventory/history', { params });
      const data = response.data.data;
      return {
        data: data.transactions || [],
        total: data.total || 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil((data.total || 0) / (params.limit || 10))
      } as PaginatedHistory;
    },
  });
}

export function useWarehouses(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: async () => {
      const response = await api.get('/warehouses', { params });
      return response.data.data as Warehouse[];
    },
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: async () => {
      const response = await api.get(`/warehouses/${id}`);
      return response.data.data as Warehouse;
    },
    enabled: !!id,
  });
}

export function useStockHealth(warehouseId?: string) {
  return useQuery({
    queryKey: ['inventory', 'health', warehouseId],
    queryFn: async () => {
      const response = await api.get('/inventory/health', { params: { warehouseId } });
      return response.data.data as StockHealth;
    },
  });
}

// Mutations
export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { productId: string; variantId?: string; warehouseId: string; quantityDelta: number; reason: string }) => {
      return api.post('/inventory/adjust', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Stock adjusted successfully');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to adjust stock')
  });
}

export function useReceiveStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { productId: string; variantId?: string; warehouseId: string; quantity: number; reason: string }) => {
      return api.post('/inventory/receive', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Stock received successfully');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to receive stock')
  });
}

export function useTransferStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { productId: string; variantId?: string; fromWarehouseId: string; toWarehouseId: string; quantity: number; reason: string }) => {
      return api.post('/inventory/transfer', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Stock transferred successfully');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to transfer stock')
  });
}

