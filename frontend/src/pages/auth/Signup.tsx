import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';
import { Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupValues = z.infer<typeof signupSchema>;

export function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const passwordVal = watch('password') || '';

  // Password requirements checklist indicators
  const requirements = [
    { label: 'At least 8 characters', met: passwordVal.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(passwordVal) },
    { label: 'One number', met: /[0-9]/.test(passwordVal) },
  ];

  React.useEffect(() => {
    // Clear any leftover auth errors when visiting signup
    useAuthStore.setState({ error: null });
  }, []);

  const onSubmit = async (data: SignupValues) => {
    try {
      await signup(data.firstName, data.lastName, data.email, data.password);
      navigate('/onboarding/workspace', { replace: true });
    } catch (err) {
      // Handled by auth store
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
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create your account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your details below to set up your profile
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Account creation failed</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              First Name
            </Label>
            <Input
              id="firstName"
              placeholder="Max"
              {...register('firstName')}
              className={errors.firstName ? 'border-destructive focus-visible:ring-destructive' : 'h-11'}
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Last Name
            </Label>
            <Input
              id="lastName"
              placeholder="Robinson"
              {...register('lastName')}
              className={errors.lastName ? 'border-destructive focus-visible:ring-destructive' : 'h-11'}
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            {...register('email')}
            className={errors.email ? 'border-destructive focus-visible:ring-destructive' : 'h-11'}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'h-11 pr-10'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive pr-10' : 'h-11 pr-10'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Password Strength Checklist */}
        {passwordVal && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password Requirements</p>
            <div className="grid grid-cols-1 gap-1.5">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <ShieldCheck className={req.met ? 'h-4 w-4 text-emerald-500' : 'h-4 w-4 text-slate-350 dark:text-slate-605'} />
                  <span className={req.met ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500'}>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button className="w-full h-11" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
      </form>

      <div className="text-center text-xs text-slate-450">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}
