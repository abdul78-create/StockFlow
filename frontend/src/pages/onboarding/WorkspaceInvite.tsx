import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';
import { Loader2, AlertCircle, Plus, Trash2, Users, ArrowRight } from 'lucide-react';

const inviteSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email('Invalid email address'),
      role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
    })
  ).min(1, 'Please add at least one invite'),
});

type InviteValues = z.infer<typeof inviteSchema>;

export function WorkspaceInvite() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      invites: [{ email: '', role: 'STAFF' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'invites',
  });

  const onSubmit = async (data: InviteValues) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check for duplicate emails in the list
      const emails = data.invites.map((i) => i.email.trim().toLowerCase());
      const uniqueEmails = new Set(emails);
      if (uniqueEmails.size !== emails.length) {
        setError('Duplicate email addresses are not allowed in the invite list.');
        setIsLoading(false);
        return;
      }

      const validInvites = data.invites.filter((inv) => inv.email.trim() !== '');
      if (validInvites.length === 0) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // Execute all invitation requests
      const results = await Promise.all(
        validInvites.map(async (invite) => {
          try {
            await api.post('/workspaces/invitations', {
              email: invite.email.trim(),
              role: invite.role,
            });
            return { email: invite.email, success: true, role: invite.role };
          } catch (e: any) {
            return { email: invite.email, success: false, role: invite.role, message: e.response?.data?.message };
          }
        })
      );

      const failures = results.filter((r) => !r.success);
      
      if (failures.length > 0) {
        // Keep only failed rows in the form
        const remainingInvites = failures.map((f) => ({ email: f.email, role: f.role as any }));
        form.setValue('invites', remainingInvites);

        const failedEmails = failures.map((f) => f.email).join(', ');
        setError(`Failed to send invitations to: ${failedEmails}. Please correct or skip.`);
      } else {
        // All succeeded
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError('An unexpected error occurred while sending invites.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard', { replace: true });
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
        <Users className="h-6 w-6 text-slate-700 dark:text-slate-300" />
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Invite your team
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Invite members to collaborate in your organization workspace
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Invitation failed</p>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2.5">
                <FormField
                  control={form.control}
                  name={`invites.${index}.email`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="teammate@company.com"
                          {...field}
                          className="h-11"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`invites.${index}.role`}
                  render={({ field }) => (
                    <FormItem className="w-[120px]">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="STAFF">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="h-11 w-11 text-slate-400 hover:text-destructive transition-colors shrink-0"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed h-11"
            onClick={() => append({ email: '', role: 'STAFF' })}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Another Invitee
          </Button>

          <div className="flex gap-4 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full h-11 text-slate-500 hover:text-slate-900"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip for now
            </Button>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invites <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
export default WorkspaceInvite;
