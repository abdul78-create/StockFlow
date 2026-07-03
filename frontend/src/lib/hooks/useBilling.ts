import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { toast } from 'sonner';

export interface Subscription {
  id: string;
  plan: 'STARTER' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  currentPeriodEnd: string;
}

export function useSubscription() {
  return useQuery<Subscription>({
    queryKey: ['billing', 'subscription'],
    queryFn: async () => {
      const response = await api.get('/billing/subscription');
      return response.data.data;
    },
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: 'PRO' | 'ENTERPRISE') => {
      const response = await api.post('/billing/subscribe', { plan });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['billing', 'subscription'], data);
      toast.success('Subscription Upgraded', {
        description: `You have successfully upgraded to the ${data.plan} plan.`,
      });
    },
    onError: (error: any) => {
      toast.error('Upgrade Failed', {
        description: error.response?.data?.message || 'Something went wrong',
      });
    },
  });
}
