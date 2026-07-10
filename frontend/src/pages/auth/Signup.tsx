import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Eye, EyeOff, Sparkles, Check, X } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

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
  const { signup, googleLogin, isLoading, error } = useAuthStore();
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

  const requirements = [
    { label: 'At least 8 characters', met: passwordVal.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(passwordVal) },
    { label: 'One number', met: /[0-9]/.test(passwordVal) },
  ];

  React.useEffect(() => {
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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        navigate('/onboarding/workspace', { replace: true });
      }
    } catch (e) {
      // Handled by auth store error state
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none select-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none select-none" />

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
            Create your master operations center.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Invite your team members, isolate warehouse zones, and configure automated supplier reordering systems in under 5 minutes.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} StockFlow. All rights reserved.
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 z-10 overflow-y-auto">
        <div className="w-full max-w-[440px] space-y-8 py-8 animate-fade-in-up">
          <div className="space-y-2">
            <div className="flex lg:hidden items-center gap-2.5 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950 font-bold text-sm shadow-sm">
                SF
              </div>
              <span className="font-semibold tracking-tight text-base text-white">StockFlow</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create your account
            </h1>
            <p className="text-xs text-slate-400">
              Set up your profile to activate your corporate workspace.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Account creation failed</p>
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
                  onError={() => useAuthStore.setState({ error: 'Google Signup failed.' })}
                  text="signup_with"
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
                <span className="bg-transparent px-3 text-slate-500 font-bold">Or register with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Max"
                    {...register('firstName')}
                    className={errors.firstName ? 'border-destructive focus-visible:ring-destructive' : 'h-10 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-600'}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-[11px] text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Mustermann"
                    {...register('lastName')}
                    className={errors.lastName ? 'border-destructive focus-visible:ring-destructive' : 'h-10 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-600'}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-[11px] text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

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
                <Label htmlFor="password" className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Password
                </Label>
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
                {/* Requirements indicator list */}
                <div className="pt-1.5 space-y-1">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                      {req.met ? (
                        <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="h-3 w-3 text-slate-600 shrink-0" />
                      )}
                      <span className={req.met ? 'text-slate-300' : 'text-slate-550'}>{req.label}</span>
                    </div>
                  ))}
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive pr-10' : 'h-10 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-600 pr-10'}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 mt-2" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          </div>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-slate-350 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
