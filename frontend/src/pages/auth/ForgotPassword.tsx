import * as React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/lib/icons';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Reset password for:', data.email);
    setIsSubmitted(true);
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="rounded-xl border bg-card text-card-foreground shadow p-8"
    >
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Forgot Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {isSubmitted ? (
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-success/10 p-3 text-success">
            <Icons.success className="h-6 w-6" />
          </div>
          <p className="text-sm">
            If an account exists for that email, we have sent a password reset link.
          </p>
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link to="/login">Return to Login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register('email')}
              className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
          <div className="text-center text-sm">
            <Link to="/login" className="text-primary hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </motion.div>
  );
}
