import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/lib/icons';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/workspace';
import { useAuthStore } from '@/store/auth';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
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
        // We need to fetch the updated user profile to get the new organization, 
        // or just add it directly to the workspace store.
        const org = res.data.data;
        // Fetch fresh profile to populate memberships
        await useAuthStore.getState().checkAuth();
        
        // Ensure the store is updated, then set the active workspace
        useWorkspaceStore.getState().setActiveWorkspace(org.id);
        
        navigate('/onboarding/industry', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create workspace.');
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
      className="rounded-xl border bg-card text-card-foreground shadow p-8"
    >
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Name your workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          You can use the name of your company or organization.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
            <Icons.error className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Workspace Name</Label>
          <Input
            id="name"
            placeholder="Acme Corporation"
            {...register('name')}
            className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </form>
    </motion.div>
  );
}
