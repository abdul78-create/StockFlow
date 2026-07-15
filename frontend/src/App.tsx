import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "./lib/store/auth";
import { useWorkspaceStore } from "./lib/store/workspace";
import { useThemeStore } from "./lib/store/theme";
import api from "./lib/api";

// Public / Auth Pages
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { VerifyEmail } from "./pages/VerifyEmail";
import { Onboarding } from "./pages/Onboarding";

// Protected Pages
import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Inventory } from "./pages/Inventory";
import { Warehouses } from "./pages/Warehouses";
import { Customers } from "./pages/Customers";
import { Suppliers } from "./pages/Suppliers";
import { PurchaseOrders } from "./pages/PurchaseOrders";
import { SalesOrders } from "./pages/SalesOrders";
import { Finance } from "./pages/Finance";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { Quotations } from "./pages/Quotations";
import { PurchaseReturns } from "./pages/PurchaseReturns";
import { SalesReturns } from "./pages/SalesReturns";

function GuestRoute({ children }: { children: React.ReactNode }) {
  // Guest users are allowed to see login/signup. We do NOT force redirect if authenticated,
  // to ensure users can explicitly navigate to /login and /signup.
  return <>{children}</>;
}

function ProtectedRoute({ children, requireWorkspace = true }: { children: React.ReactNode, requireWorkspace?: boolean }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (requireWorkspace && !activeWorkspace) {
    return <Navigate to="/onboarding" replace />;
  }

  return <AppShell>{children}</AppShell>;
}

export default function App() {
  const isDark = useThemeStore((s) => s.isDark);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await api.get("/auth/me");
        const user = res.data.data;
        const organizations = user.organizations || [];
        
        setAuth(user);

        const activeWorkspaceId = localStorage.getItem("activeWorkspaceId");
        if (organizations.length > 0) {
          const formattedWorkspaces = organizations.map((o: any) => ({
            id: o.id,
            name: o.name,
          }));
          setWorkspaces(formattedWorkspaces);

          const active = organizations.find((o: any) => o.id === activeWorkspaceId) || organizations[0];
          setActiveWorkspace({ id: active.id, name: active.name });
        } else {
          setWorkspaces([]);
          setActiveWorkspace(null);
        }
      } catch {
        clearAuth();
        setActiveWorkspace(null);
        setWorkspaces([]);
      } finally {
        setIsVerifying(false);
      }
    };
    verifySession();
  }, [setAuth, clearAuth, setActiveWorkspace, setWorkspaces]);

  if (isVerifying) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Onboarding is protected but does NOT require a workspace */}
      <Route path="/onboarding" element={<ProtectedRoute requireWorkspace={false}><Onboarding /></ProtectedRoute>} />
      
      {/* Protected Routes (Require Workspace) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
      <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
      <Route path="/sales-orders" element={<ProtectedRoute><SalesOrders /></ProtectedRoute>} />
      <Route path="/quotations" element={<ProtectedRoute><Quotations /></ProtectedRoute>} />
      <Route path="/purchase-returns" element={<ProtectedRoute><PurchaseReturns /></ProtectedRoute>} />
      <Route path="/sales-returns" element={<ProtectedRoute><SalesReturns /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<div className="flex h-screen items-center justify-center text-gray-500 font-medium">Page not found</div>} />
    </Routes>
  );
}
