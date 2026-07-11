import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  BarChart3,
  Factory,
  Users,
  TrendingUp,
  ShoppingCart,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../lib/store/auth";
import { useWorkspaceStore } from "../lib/store/workspace";
import api from "../lib/api";

const FEATURES = [
  { icon: Package, text: "Real-time inventory tracking" },
  { icon: ShoppingCart, text: "Purchase & sales orders" },
  { icon: BarChart3, text: "Financial analytics" },
  { icon: Users, text: "Role-based access control" },
  { icon: Factory, text: "Multi-warehouse management" },
  { icon: TrendingUp, text: "Automated alerts" },
];

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, organizations } = res.data.data;

      if (!organizations || organizations.length === 0) {
        setAuth(user);
        navigate("/onboarding");
      } else {
        // organizations from login contains { id, name, role, membershipId }
        const active = organizations[0];
        setActiveWorkspace({
          id: active.id,
          name: active.name,
        });
        setAuth(user);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-gray-900 selection:text-white">
      {/* ─── LEFT PANEL — Branding ─── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0A0A0A] text-white flex-col p-12 relative overflow-hidden border-r border-gray-800">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5 relative z-10"
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-gray-900 font-bold text-xs tracking-tighter">SF</span>
            </div>
            <span className="text-lg font-bold tracking-tight">StockFlow</span>
          </Link>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center relative z-10 max-w-sm mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold tracking-tighter leading-tight mb-4">
              Enterprise inventory,
              <br />
              <span className="text-gray-500">simplified.</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-12">
              Sign in to manage your products, warehouses, orders, and finances in a secure, unified workspace.
            </p>

            <div className="space-y-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <f.icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-300">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── RIGHT PANEL — Form ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white relative">
        <div className="lg:hidden flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-tighter">SF</span>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">StockFlow</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[360px]"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-600 font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <Input
                id="login-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              id="login-submit"
              type="submit"
              variant="primary"
              className="w-full h-10 mt-2 text-sm font-medium rounded-md shadow-sm"
              isLoading={loading}
            >
              {!loading && "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-gray-900 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
