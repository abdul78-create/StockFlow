import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export type SalesOrderStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'PACKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface SalesOrderItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  dispatchedQuantity?: number;
  product?: {
    name: string;
    sku: string;
  };
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  customerId: string;
  status: SalesOrderStatus;
  totalAmount: number;
  createdAt: string;
  customer: {
    name: string;
  };
  items: SalesOrderItem[];
}

export interface PaginatedSalesOrders {
  data: SalesOrder[];
  total: number;
}

export function useSalesOrders(params?: { status?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['sales-orders', params],
    queryFn: async () => {
      const response = await api.get('/sales-orders', { params });
      return response.data as PaginatedSalesOrders;
    },
  });
}

export function useSalesOrder(id: string) {
  return useQuery({
    queryKey: ['sales-order', id],
    queryFn: async () => {
      const response = await api.get(`/sales-orders/${id}`);
      return response.data.data as SalesOrder;
    },
    enabled: !!id,
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { customerId: string; items: SalesOrderItem[] }) => {
      const soNumber = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      return api.post('/sales-orders', { ...data, soNumber });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      toast.success('Sales Order created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create Sales Order');
    },
  });
}

export function useUpdateSalesOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; status: SalesOrderStatus; warehouseId?: string }) => {
      return api.patch(`/sales-orders/${data.id}/status`, { 
        status: data.status,
        ...(data.warehouseId ? { warehouseId: data.warehouseId } : {})
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(`Sales Order status updated to ${variables.status}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update status');
    },
  });
}

export function useDispatchSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; warehouseId: string }) => {
      return api.post(`/sales-orders/${data.id}/dispatch`, {
        warehouseId: data.warehouseId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Order dispatched successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to dispatch order');
    },
  });
}
