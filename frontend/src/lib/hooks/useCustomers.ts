import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Customer, CustomerFormValues } from '../types/customer';
import { toast } from 'sonner';

export function useCustomers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async () => {
      const response = await api.get('/customers', { params });
      return response.data.data.customers as Customer[];
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await api.get(`/customers/${id}`);
      return response.data.data as Customer;
    },
    enabled: !!id,
  });
}

export function useCustomerStats(id: string) {
  return useQuery({
    queryKey: ['customer-stats', id],
    queryFn: async () => {
      const response = await api.get(`/customers/${id}/stats`);
      return response.data.data as {
        totalOrders: number;
        totalRevenue: number;
        lastOrderDate: string | null;
      };
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      return api.post('/customers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create customer');
    }
  });
}
