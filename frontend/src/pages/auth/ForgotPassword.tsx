import * as React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Reset password for:', data.email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none select-none" />

      <div className="w-full max-w-[400px] space-y-8 animate-fade-in-up z-10">
        <div className="space-y-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-950 font-bold text-base shadow-sm mx-auto">
            SF
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Forgot Password
            </h1>
            <p className="text-xs text-slate-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        </div>

        {/* Card wrapper */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          {isSubmitted ? (
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account exists for that email, we have sent a password reset link.
              </p>
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full h-10 text-xs font-semibold border-white/10 hover:bg-white/5">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive focus-visible:ring-destructive' : 'h-10 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-650'}
                />
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email.message}</p>
                )}
              </div>
              <Button className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 mt-2" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              <div className="text-center text-xs">
                <Link to="/login" className="font-bold text-slate-400 hover:text-white transition-colors">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
export default ForgotPassword;
