import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Category } from '../types/category';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Category[] }>('/categories');
      return response.data.data;
    },
  });
}
