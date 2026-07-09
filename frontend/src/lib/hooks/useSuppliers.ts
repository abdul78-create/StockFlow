import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Supplier, SupplierFormValues } from '../types/supplier';
import { toast } from 'sonner';

export function useSuppliers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: async () => {
      const response = await api.get('/suppliers', { params });
      return response.data.data as Supplier[];
    },
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const response = await api.get(`/suppliers/${id}`);
      return response.data.data as Supplier;
    },
    enabled: !!id,
  });
}

export function useSupplierStats(id: string) {
  return useQuery({
    queryKey: ['supplier-stats', id],
    queryFn: async () => {
      const response = await api.get(`/suppliers/${id}/stats`);
      return response.data.data as {
        totalOrders: number;
        totalSpend: number;
        lastOrderDate: string | null;
      };
    },
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SupplierFormValues) => {
      return api.post('/suppliers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create supplier');
    }
  });
}
export function useUpdateSupplier(id: string) { const queryClient = useQueryClient(); return useMutation({ mutationFn: async (data: any) => api.put(`/suppliers/${id}`, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); queryClient.invalidateQueries({ queryKey: ['supplier', id] }); toast.success('Supplier updated'); } }); }
