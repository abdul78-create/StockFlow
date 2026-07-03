import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/lib/icons';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

const inviteSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email('Invalid email'),
      role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
    })
  ).min(1, 'Please add at least one invite'),
});

type InviteValues = z.infer<typeof inviteSchema>;

export function WorkspaceInvite() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      invites: [{ email: '', role: 'STAFF' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invites',
  });

  const onSubmit = async (data: InviteValues) => {
    try {
      setIsLoading(true);
      // Filter out empty emails
      const validInvites = data.invites.filter((inv) => inv.email.trim() !== '');
      
      for (const invite of validInvites) {
        // Send invitations one by one, ignore individual failures for onboarding flow
        await api.post('/workspaces/invitations', invite).catch(() => {});
      }
      
      // Navigate to Dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Allow proceeding even if invites fail
      navigate('/dashboard', { replace: true });
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
      className="rounded-xl border bg-card text-card-foreground shadow p-8 max-w-lg mx-auto w-full"
    >
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Invite your team
        </h1>
        <p className="text-sm text-muted-foreground">
          StockFlow is better with your team. Invite them to your workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {fields.map((field, index) => {
            const roleValue = watch(`invites.${index}.role`);
            
            return (
              <div key={field.id} className="flex items-start space-x-2">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="teammate@example.com"
                    {...register(`invites.${index}.email` as const)}
                    className={errors.invites?.[index]?.email ? 'border-destructive' : ''}
                  />
                  {errors.invites?.[index]?.email && (
                    <p className="text-xs text-destructive">{errors.invites[index]?.email?.message}</p>
                  )}
                </div>
                <div className="w-[120px]">
                  <Select onValueChange={(val) => setValue(`invites.${index}.role`, val as any)} value={roleValue}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Icons.delete className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-dashed"
          onClick={() => append({ email: '', role: 'STAFF' })}
        >
          <Icons.add className="mr-2 h-4 w-4" />
          Add another
        </Button>

        <div className="flex space-x-4 pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full"
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip for now
          </Button>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
            Send Invites
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
