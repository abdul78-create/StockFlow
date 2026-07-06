import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';
import { Loader2, AlertCircle, BarChart } from 'lucide-react';

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
      industry: '',
    }
  });

  const watchIndustry = watch('industry');
  const watchTimezone = watch('timezone');
  const watchCurrency = watch('currency');

  const onSubmit = async (data: IndustryValues) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update details for the active workspace context
      await api.patch('/workspaces/details', { 
        industry: data.industry,
        timezone: data.timezone,
        currency: data.currency
      });

      navigate('/onboarding/invite', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update workspace details. Inputs preserved.');
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
        <BarChart className="h-6 w-6 text-slate-700 dark:text-slate-300" />
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Configure business details
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This helps configure currencies, date formats, and defaults
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Configuration failed</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider font-semibold text-slate-500">Industry</Label>
          <Select onValueChange={(val) => setValue('industry', val)} value={watchIndustry}>
            <SelectTrigger className={errors.industry ? 'border-destructive focus-visible:ring-destructive h-11' : 'h-11'}>
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
          {errors.industry && <p className="text-xs text-destructive">{errors.industry.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-semibold text-slate-500">Currency</Label>
            <Select onValueChange={(val) => setValue('currency', val)} value={watchCurrency}>
              <SelectTrigger className="h-11">
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
            <Label className="text-xs uppercase tracking-wider font-semibold text-slate-500">Timezone</Label>
            <Select onValueChange={(val) => setValue('timezone', val)} value={watchTimezone}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC (Universal Time)</SelectItem>
                <SelectItem value="America/New_York">New York (EST/EDT)</SelectItem>
                <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                <SelectItem value="Asia/Kolkata">Kolkata (IST)</SelectItem>
                <SelectItem value="Asia/Singapore">Singapore (SGT)</SelectItem>
                <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full h-11" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </form>
    </motion.div>
  );
}
