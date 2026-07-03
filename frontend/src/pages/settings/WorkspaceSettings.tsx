import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/lib/icons';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/workspace';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  timezone: z.string().min(1, 'Please select a timezone'),
  currency: z.string().min(1, 'Please select a currency'),
});

type WorkspaceValues = z.infer<typeof workspaceSchema>;

export function WorkspaceSettings() {
  const { organizations, activeWorkspaceId, setOrganizations } = useWorkspaceStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

  const activeWorkspace = organizations.find(o => o.id === activeWorkspaceId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: '',
      industry: '',
      timezone: 'UTC',
      currency: 'USD',
    }
  });

  React.useEffect(() => {
    // Fetch current details
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/workspaces/details`);
        if (res.data?.success) {
          const data = res.data.data;
          reset({
            name: data.name || '',
            industry: data.industry || '',
            timezone: data.timezone || 'UTC',
            currency: data.currency || 'USD',
          });
        }
      } catch (err) {
        // Handle error implicitly
      }
    };
    if (activeWorkspaceId) {
      fetchDetails();
    }
  }, [activeWorkspaceId, reset]);

  const watchIndustry = watch('industry');
  const watchTimezone = watch('timezone');
  const watchCurrency = watch('currency');

  const onSubmit = async (data: WorkspaceValues) => {
    try {
      setIsLoading(true);
      setMessage(null);
      // We'll update details and potentially name. 
      // Assuming PATCH /workspaces/:id handles name, industry, etc.
      // Wait, our backend Phase A has PATCH /workspaces/:id for name 
      // and PATCH /workspaces/details for industry/timezone/currency.
      // Let's call both or just one if we combined them.
      // Assuming we have to call both based on backend design.
      
      await api.patch(`/workspaces/details`, { name: data.name });
      await api.patch('/workspaces/details', {
        industry: data.industry,
        timezone: data.timezone,
        currency: data.currency
      });

      // Update local store name
      const updatedOrgs = organizations.map(o => 
        o.id === activeWorkspaceId ? { ...o, name: data.name } : o
      );
      setOrganizations(updatedOrgs);

      setMessage({ type: 'success', text: 'Workspace updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update workspace.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you absolutely sure? This action cannot be undone.')) return;
    try {
      setIsDeleting(true);
      await api.delete(`/workspaces/details`);
      window.location.href = '/dashboard'; // Reload to clear state
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete workspace.' });
      setIsDeleting(false);
    }
  };

  if (!activeWorkspace) return null;

  const isOwner = activeWorkspace.role === 'OWNER';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Workspace Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your organization's general settings and preferences.
        </p>
      </div>
      <hr />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {message && (
          <div className={`rounded-md p-3 text-sm flex items-center gap-2 ${message.type === 'error' ? 'bg-destructive/15 text-destructive' : 'bg-green-500/15 text-green-600'}`}>
            {message.type === 'error' ? <Icons.error className="h-4 w-4" /> : <Icons.success className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <div className="space-y-2">
          <Label>Workspace Name</Label>
          <Input
            {...register('name')}
            disabled={!isOwner}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Industry</Label>
          <Select onValueChange={(val) => setValue('industry', val, { shouldDirty: true })} value={watchIndustry} disabled={!isOwner}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Retail">Retail</SelectItem>
              <SelectItem value="Wholesale">Wholesale</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="E-commerce">E-commerce</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select onValueChange={(val) => setValue('currency', val, { shouldDirty: true })} value={watchCurrency} disabled={!isOwner}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="AUD">AUD (A$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select onValueChange={(val) => setValue('timezone', val, { shouldDirty: true })} value={watchTimezone} disabled={!isOwner}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                <SelectItem value="America/New_York">EST/EDT (New York)</SelectItem>
                <SelectItem value="Europe/London">GMT/BST (London)</SelectItem>
                <SelectItem value="Asia/Kolkata">IST (New Delhi)</SelectItem>
                <SelectItem value="Asia/Singapore">SGT (Singapore)</SelectItem>
                <SelectItem value="Australia/Sydney">AEST (Sydney)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isOwner && (
          <Button type="submit" disabled={!isDirty || isLoading}>
            {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        )}
      </form>

      {isOwner && (
        <div className="mt-10 border border-destructive/20 rounded-xl p-6 bg-destructive/5 max-w-2xl">
          <h4 className="text-base font-medium text-destructive mb-2">Danger Zone</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete this workspace and all of its data. This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
            Delete Workspace
          </Button>
        </div>
      )}
    </div>
  );
}
