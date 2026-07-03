import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/lib/icons';
import { useAuthStore } from '@/store/auth';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    }
  });

  const onSubmit = async (data: ProfileValues) => {
    try {
      setIsLoading(true);
      setMessage(null);
      
      // We don't have PATCH /auth/profile yet in the backend, so we mock success
      await new Promise(r => setTimeout(r, 1000));
      
      setMessage({ type: 'success', text: 'Profile updated successfully. (Mocked - API not yet available)' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Personal Profile</h3>
        <p className="text-sm text-muted-foreground">
          Update your personal details.
        </p>
      </div>
      <hr />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        {message && (
          <div className={`rounded-md p-3 text-sm flex items-center gap-2 ${message.type === 'error' ? 'bg-destructive/15 text-destructive' : 'bg-green-500/15 text-green-600'}`}>
            {message.type === 'error' ? <Icons.error className="h-4 w-4" /> : <Icons.success className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              {...register('firstName')}
              className={errors.firstName ? 'border-destructive' : ''}
            />
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              {...register('lastName')}
              className={errors.lastName ? 'border-destructive' : ''}
            />
            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            value={user?.email || ''}
            disabled
            className="bg-muted text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Your email cannot be changed.
          </p>
        </div>

        <Button type="submit" disabled={!isDirty || isLoading}>
          {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </form>
    </div>
  );
}
