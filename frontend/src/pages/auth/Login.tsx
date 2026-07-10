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
import { Loader2, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

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
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none select-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none select-none" />

      {/* Brand Side - Hidden on small screens */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative border-r border-white/5 bg-slate-900/20 backdrop-blur-3xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950 font-bold text-sm tracking-tight shadow-sm">
            SF
          </div>
          <span className="font-semibold tracking-tight text-base text-white">StockFlow</span>
        </div>

        <div className="space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Premium ERP Solution</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
            Simplify multi-warehouse inventory operations.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Real-time synchronization, intelligent automated replenishments, and advanced margin controls designed for modern enterprise scaling.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} StockFlow. All rights reserved.
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-[420px] space-y-8 animate-fade-in-up">
          <div className="space-y-2">
            <div className="flex lg:hidden items-center gap-2.5 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950 font-bold text-sm shadow-sm">
                SF
              </div>
              <span className="font-semibold tracking-tight text-base text-white">StockFlow</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-xs text-slate-400">
              Sign in to your organization workspace to continue.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Authentication failed</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Glass Card Container */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            {/* Google Sign In */}
            <div className="w-full flex justify-center flex-col items-center">
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => useAuthStore.setState({ error: 'Google Login failed.' })}
                  text="continue_with"
                  width="100%"
                  theme="filled_black"
                  size="large"
                />
              ) : (
                <Button variant="outline" className="w-full h-10 border-white/10 bg-white/5 hover:bg-white/10 text-xs" disabled>
                  <span>Continue with Google (Not Configured)</span>
                </Button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-transparent px-3 text-slate-500 font-bold">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive focus-visible:ring-destructive' : 'h-10 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-600'}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors"
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
                    className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'h-10 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-600 pr-10'}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 py-1">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
                  disabled={isLoading}
                  className="border-white/20 bg-slate-950/50 data-[state=checked]:bg-white data-[state=checked]:text-slate-950"
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-xs font-medium text-slate-400 select-none cursor-pointer"
                >
                  Keep me signed in on this device
                </Label>
              </div>

              <Button className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200" type="submit" disabled={isLoading}>
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
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-slate-350 hover:text-white transition-colors"
            >
              Create Workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
