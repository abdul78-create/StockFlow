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
        const remainingInvites = failures.map((f) => ({ email: f.email, role: f.role as any }));
        form.setValue('invites', remainingInvites);

        const failedEmails = failures.map((f) => f.email).join(', ');
        setError(`Failed to send invitations to: ${failedEmails}. Please correct or skip.`);
      } else {
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none select-none" />

      <div className="w-full max-w-[460px] space-y-8 animate-fade-in-up z-10">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner">
            <Users className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Invite your team
            </h1>
            <p className="text-xs text-slate-400">
              Invite members to collaborate in your organization workspace.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Invitation failed</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Card Wrapper */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`invites.${index}.email`}
                      render={({ field: inputField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="teammate@company.com"
                              {...inputField}
                              className="h-9 border-white/10 bg-slate-950/50 text-white text-xs placeholder:text-slate-650"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`invites.${index}.role`}
                      render={({ field: inputField }) => (
                        <FormItem className="w-[100px]">
                          <Select
                            onValueChange={inputField.onChange}
                            defaultValue={inputField.value}
                            disabled={isLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9 border-white/10 bg-slate-950/50 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="MANAGER">Manager</SelectItem>
                              <SelectItem value="STAFF">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-9 w-9 text-slate-500 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-white/10 bg-transparent text-xs h-9 hover:bg-white/5"
                onClick={() => append({ email: '', role: 'STAFF' })}
                disabled={isLoading}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Another Invitee
              </Button>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full h-10 text-xs text-slate-400 hover:text-white"
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  Skip for now
                </Button>
                <Button type="submit" className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Invites <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center items-center gap-1.5 pt-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white/20 transition-all duration-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20 transition-all duration-300" />
          <span className="h-1.5 w-6 rounded-full bg-white transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}
export default WorkspaceInvite;
