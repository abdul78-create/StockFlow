import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export type SalesOrderStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface SalesOrderItem {
  id?: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  shippedQuantity?: number;
  cogs?: number;
  product?: {
    name: string;
    sku: string;
  };
  variant?: {
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
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  createdAt: string;
  customer: {
    name: string;
  };
  items: SalesOrderItem[];
}

export interface PaginatedSalesOrders {
  data: SalesOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useSalesOrders(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  customerId?: string;
}) {
  return useQuery({
    queryKey: ['sales-orders', params],
    queryFn: async () => {
      const response = await api.get('/sales-orders', { params });
      const data = response.data.data;
      return {
        data: (data.orders || []).map((order: SalesOrder) => ({
          ...order,
          items: order.items.map(item => ({
            ...item,
            variantId: item.variantId === '' ? undefined : item.variantId
          }))
        })),
        total: data.total || 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil((data.total || 0) / (params.limit || 10))
      } as PaginatedSalesOrders;
    },
  });
}

export function useSalesOrder(id: string) {
  return useQuery({
    queryKey: ['sales-orders', id],
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
    mutationFn: async (data: { 
      customerId: string; 
      items: SalesOrderItem[];
      shippingCost?: number;
      taxAmount?: number;
      discountAmount?: number;
      notes?: string;
    }) => {
      const soNumber = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        ...data,
        soNumber,
        items: data.items.map(item => {
          const newItem = { ...item };
          if (!newItem.variantId) {
            delete newItem.variantId;
          }
          return newItem;
        })
      };
      const res = await api.post('/sales-orders', payload);
      const id = res?.data?.data?.id || res?.data?.id || (res as any)?.id;
      return { id, ...res.data };
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
      queryClient.invalidateQueries({ queryKey: ['sales-orders', variables.id] });
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
    mutationFn: async (data: { 
      id: string; 
      warehouseId: string;
      items?: { productId: string; variantId?: string; quantity: number; batchId?: string }[]
    }) => {
      return api.post(`/sales-orders/${data.id}/dispatch`, {
        warehouseId: data.warehouseId,
        items: data.items
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Order shipped successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to dispatch order');
    },
  });
}
