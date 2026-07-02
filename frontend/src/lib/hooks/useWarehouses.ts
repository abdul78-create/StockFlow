import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Warehouse, WarehouseFormValues } from '../types/warehouse';
import { toast } from 'sonner';

interface PaginatedWarehouses {
  data: Warehouse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useWarehouses(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: async () => {
      const response = await api.get('/warehouses', { params });
      return response.data.data as Warehouse[];
    },
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: WarehouseFormValues) => {
      return api.post('/warehouses', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create warehouse');
    }
  });
}
