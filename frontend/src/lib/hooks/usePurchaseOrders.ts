import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export type PurchaseOrderStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id?: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity?: number;
  landedUnitCost?: number;
  product?: {
    name: string;
    sku: string;
  };
  variant?: {
    name: string;
    sku: string;
  };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  shippingCost?: number;
  taxAmount?: number;
  otherCosts?: number;
  expectedDate?: string;
  notes?: string;
  createdAt: string;
  supplier: {
    companyName: string;
  };
  items: PurchaseOrderItem[];
}

export interface PaginatedPurchaseOrders {
  data: PurchaseOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function usePurchaseOrders(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  supplierId?: string;
}) {
  return useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: async () => {
      const response = await api.get('/purchase-orders', { params });
      const data = response.data.data;
      return {
        data: data.orders || [],
        total: data.total || 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil((data.total || 0) / (params.limit || 10))
      } as PaginatedPurchaseOrders;
    },
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: async () => {
      const response = await api.get(`/purchase-orders/${id}`);
      return response.data.data as PurchaseOrder;
    },
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { supplierId: string; expectedDate?: Date; shippingCost?: number; taxAmount?: number; otherCosts?: number; notes?: string; items: PurchaseOrderItem[] }) => {
      const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        ...data,
        poNumber,
        items: data.items.map(item => {
          const newItem = { ...item };
          if (!newItem.variantId) {
            delete newItem.variantId;
          }
          return newItem;
        })
      };
      console.log('SENDING PAYLOAD:', JSON.stringify(payload));
      const res = await api.post('/purchase-orders', payload);
      const id = res?.data?.data?.id || res?.data?.id || (res as any)?.id;
      return { id, ...res.data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase Order created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create Purchase Order');
    },
  });
}

export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; status: PurchaseOrderStatus }) => {
      return api.patch(`/purchase-orders/${data.id}/status`, { status: data.status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', variables.id] });
      toast.success(`Purchase Order status updated to ${variables.status}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update Purchase Order status');
    },
  });
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; warehouseId: string; items: { productId: string; variantId?: string; quantity: number; batchNumber?: string; manufacturingDate?: Date; expiryDate?: Date }[] }) => {
      return api.post(`/purchase-orders/${data.id}/receive`, {
        warehouseId: data.warehouseId,
        items: data.items,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Goods received successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to receive goods');
    },
  });
}
