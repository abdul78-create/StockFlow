import * as React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth';
import { useWorkspaceStore } from '@/store/workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

import { GoogleLogin } from '@react-oauth/google';

// ... (imports remain at the top)

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, isLoading, error } = useAuthStore();
  const from = location.state?.from?.pathname || '/dashboard';

  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  React.useEffect(() => {
    // Clear any leftover auth errors when visiting login
    useAuthStore.setState({ error: null });
  }, []);

  const onSubmit = async (data: LoginValues) => {
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (e) {
      // Handled by auth store error state
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        
        // After login, check if the user has any organizations
        const orgs = useWorkspaceStore.getState().organizations;
        if (orgs.length === 0) {
          navigate('/onboarding/workspace', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (e) {
      // Handled by auth store error state
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
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your organization credentials to sign in
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Authentication failed</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center flex-col items-center gap-2">
        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => useAuthStore.setState({ error: 'Google Login failed.' })}
            text="continue_with"
            width="100%"
            theme="outline"
            size="large"
          />
        ) : (
          <Button variant="outline" className="w-full h-11" disabled>
            <span className="text-sm">Continue with Google (Not Configured)</span>
          </Button>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">Or continue with</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-slate-650 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'h-11 pr-10'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2 py-1">
          <Checkbox 
            id="rememberMe" 
            checked={rememberMe} 
            onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
            disabled={isLoading}
          />
          <Label
            htmlFor="rememberMe"
            className="text-xs font-medium text-slate-550 dark:text-slate-400 select-none cursor-pointer"
          >
            Keep me signed in on this device
          </Label>
        </div>

        <Button className="w-full h-11 text-sm font-semibold" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-450">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
        >
          Create Workspace
        </Link>
      </div>
    </motion.div>
  );
}
