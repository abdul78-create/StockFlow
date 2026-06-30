import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Supplier {
  id: string;
  companyName: string;
  email?: string;
  phone?: string;
  address?: string;
}

export function useSuppliers(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: async () => {
      const response = await api.get('/suppliers', { params });
      return response.data.data as Supplier[];
    },
  });
}
