import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product, ProductFormValues, PaginatedProducts } from '../types/product';
import { toast } from 'sonner';

export function useProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await api.get('/products', { params });
      const data = response.data.data;
      return {
        data: data.products || [],
        total: data.total || 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil((data.total || 0) / (params.limit || 10))
      } as PaginatedProducts;
    },
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/products/${id}`);
      return response.data.data as Product;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProductFormValues) => {
      return api.post('/products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create product');
    }
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<ProductFormValues>) => {
      return api.patch(`/products/${id}`, data);
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      await queryClient.cancelQueries({ queryKey: ['products', id] });

      const previousProducts = queryClient.getQueryData(['products']);
      const previousProduct = queryClient.getQueryData(['products', id]);

      // Optimistically update the list
      queryClient.setQueryData(['products'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data?.map((product: Product) => 
            product.id === id ? { ...product, ...newData } : product
          )
        };
      });

      // Optimistically update the details view
      queryClient.setQueryData(['products', id], (old: any) => {
        if (!old) return old;
        return { ...old, ...newData };
      });

      return { previousProducts, previousProduct };
    },
    onSuccess: () => {
      toast.success('Product updated successfully');
    },
    onError: (error: any, _, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      if (context?.previousProduct) {
        queryClient.setQueryData(['products', id], context.previousProduct);
      }
      toast.error(error?.response?.data?.message || 'Failed to update product');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/products/${id}`);
    },
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData(['products']);
      
      queryClient.setQueryData(['products'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data?.filter((product: Product) => product.id !== deletedId)
        };
      });

      return { previousProducts };
    },
    onSuccess: () => {
      toast.success('Product archived successfully');
    },
    onError: (error: any, _, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      toast.error(error?.response?.data?.message || 'Failed to archive product');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}



export function useAddProductVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => api.post(`/products/${productId}/variants`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success('Variant added successfully');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to add variant')
  });
}

export function useAddProductSupplier(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => api.post(`/products/${productId}/suppliers`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success('Supplier mapping added successfully');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to add supplier')
  });
}

export function useAddProductUnit(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => api.post(`/products/${productId}/units`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success('Unit added successfully');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to add unit')
  });
}
