import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/workspace';
import { useAuthStore } from '@/store/auth';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';
import { Loader2, AlertCircle, Briefcase } from 'lucide-react';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100, 'Workspace name is too long'),
});

type WorkspaceValues = z.infer<typeof workspaceSchema>;

export function CreateWorkspace() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
  });

  const onSubmit = async (data: WorkspaceValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await api.post('/workspaces', { name: data.name });
      
      if (res.data?.success) {
        const org = res.data.data;
        // Fetch fresh profile to populate memberships in Zustand auth store
        await useAuthStore.getState().checkAuth();
        // Update active workspace
        useWorkspaceStore.getState().setActiveWorkspace(org.id);
        navigate('/onboarding/industry', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create workspace. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <Briefcase className="h-6 w-6 text-slate-700 dark:text-slate-300" />
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Name your workspace
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter the name of your organization, team, or company
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Creation failed</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Workspace Name
          </Label>
          <Input
            id="name"
            placeholder="Acme Corporation"
            {...register('name')}
            className={errors.name ? 'border-destructive focus-visible:ring-destructive' : 'h-11'}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <Button className="w-full h-11" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </form>
    </motion.div>
  );
}
