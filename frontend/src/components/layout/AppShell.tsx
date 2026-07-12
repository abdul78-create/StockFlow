import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Truck, LogOut, Settings, Factory, DollarSign, FileText, ChevronDown } from "lucide-react";
import { useAuthStore } from "../../lib/store/auth";
import { useWorkspaceStore } from "../../lib/store/workspace";
import { ThemeToggle } from "../ui/ThemeToggle";
import api from "../../lib/api";

const NAVIGATION = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Inventory", href: "/inventory", icon: ShoppingCart },
  { name: "Warehouses", href: "/warehouses", icon: Factory },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
  { name: "Sales Orders", href: "/sales-orders", icon: ShoppingCart },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // ignore
    } finally {
      clearAuth();
      setActiveWorkspace(null);
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-[10px] tracking-tighter">SF</span>
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">StockFlow</span>
          </div>
        </div>

        {/* Workspace Selector (simplified) */}
        <div className="p-4 border-b border-gray-200">
          <button className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors">
            <div className="truncate font-medium text-gray-900">{activeWorkspace?.name || "Select Workspace"}</div>
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAVIGATION.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <span className="text-xs font-semibold text-gray-600">
                  {user?.name?.charAt(0) || user?.email?.charAt(0)}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 truncate max-w-[100px]">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate max-w-[100px]">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100" title="Log out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white md:hidden">
          <span className="font-semibold text-gray-900">StockFlow</span>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-sm font-medium text-gray-600">Logout</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
