import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gst?: string;
}

export function useCustomers(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async () => {
      const response = await api.get('/customers', { params });
      return response.data.data as Customer[];
    },
  });
}
