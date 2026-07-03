import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/lib/icons';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

const industrySchema = z.object({
  industry: z.string().min(1, 'Please select an industry'),
  timezone: z.string().min(1, 'Please select a timezone'),
  currency: z.string().min(1, 'Please select a currency'),
});

type IndustryValues = z.infer<typeof industrySchema>;

export function WorkspaceIndustry() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IndustryValues>({
    resolver: zodResolver(industrySchema),
    defaultValues: {
      timezone: 'UTC',
      currency: 'USD',
    }
  });

  const watchIndustry = watch('industry');
  const watchTimezone = watch('timezone');
  const watchCurrency = watch('currency');

  const onSubmit = async (data: IndustryValues) => {
    try {
      setIsLoading(true);
      setError(null);
      // Ensure we hit the correct details endpoint (patched with RBAC previously)
      await api.patch('/workspaces/details', { 
        industry: data.industry,
        timezone: data.timezone,
        currency: data.currency
      });
      navigate('/onboarding/invite', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update workspace details.');
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
          Tell us about your business
        </h1>
        <p className="text-sm text-muted-foreground">
          This helps us configure your dashboard correctly.
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
          <Label>Industry</Label>
          <Select onValueChange={(val) => setValue('industry', val)} value={watchIndustry}>
            <SelectTrigger className={errors.industry ? 'border-destructive focus-visible:ring-destructive' : ''}>
              <SelectValue placeholder="Select your industry" />
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
          {errors.industry && <p className="text-sm text-destructive">{errors.industry.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select onValueChange={(val) => setValue('currency', val)} value={watchCurrency}>
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
            <Select onValueChange={(val) => setValue('timezone', val)} value={watchTimezone}>
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

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </form>
    </motion.div>
  );
}
