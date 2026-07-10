import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
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

  const form = useForm<IndustryValues>({
    resolver: zodResolver(industrySchema),
    defaultValues: {
      timezone: 'UTC',
      currency: 'USD',
      industry: '',
    }
  });

  const onSubmit = async (data: IndustryValues) => {
    try {
      setIsLoading(true);
      setError(null);

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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none select-none" />

      <div className="w-full max-w-[440px] space-y-8 animate-fade-in-up z-10">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner">
            <BarChart className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Configure business details
            </h1>
            <p className="text-xs text-slate-400">
              This helps configure currencies, date formats, and regional defaults.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Configuration failed</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Card Wrapper */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 border-white/10 bg-slate-950/50 text-white">
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Wholesale">Wholesale</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-white/10 bg-slate-950/50 text-white">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="AUD">AUD (A$)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Timezone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 border-white/10 bg-slate-950/50 text-white">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">EST (GMT-5)</SelectItem>
                          <SelectItem value="PST">PST (GMT-8)</SelectItem>
                          <SelectItem value="IST">IST (GMT+5:30)</SelectItem>
                          <SelectItem value="AEST">AEST (GMT+10)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <Button className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 mt-2" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
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
          <span className="h-1.5 w-1.5 rounded-full bg-white/20 transition-all duration-300" />
          <span className="h-1.5 w-6 rounded-full bg-white transition-all duration-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}
export default WorkspaceIndustry;
