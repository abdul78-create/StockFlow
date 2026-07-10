import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/workspace';
import { useAuthStore } from '@/store/auth';
import { Loader2, AlertCircle, Briefcase, Sparkles } from 'lucide-react';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100, 'Workspace name is too long'),
});

type WorkspaceValues = z.infer<typeof workspaceSchema>;

export function CreateWorkspace() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: ''
    }
  });

  const onSubmit = async (data: WorkspaceValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await api.post('/workspaces', { name: data.name });
      
      if (res.data?.success) {
        const org = res.data.data;
        await useAuthStore.getState().checkAuth();
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none select-none" />

      <div className="w-full max-w-[420px] space-y-8 animate-fade-in-up z-10">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Name your workspace
            </h1>
            <p className="text-xs text-slate-400">
              Enter the name of your organization, team, or company.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Creation failed</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Card wrapper */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Workspace Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Acme Corporation"
                        {...field}
                        className="h-10 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-650"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <Button className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 mt-2" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating workspace...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center items-center gap-1.5 pt-2">
          <span className="h-1.5 w-6 rounded-full bg-white transition-all duration-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20 transition-all duration-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}
export default CreateWorkspace;
