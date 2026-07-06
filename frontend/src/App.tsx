import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DesignSystemShowcase } from '@/pages/design-system/DesignSystemShowcase';
import { DashboardLayout } from '@/components/layout/layouts/DashboardLayout';
import { AuthLayout } from '@/components/layout/layouts/AuthLayout';
import { BlankLayout } from '@/components/layout/layouts/BlankLayout';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { Login } from '@/pages/auth/Login';
import { PurchaseOrderList } from '@/pages/purchase-orders/PurchaseOrderList';
import { PurchaseOrderForm } from '@/pages/purchase-orders/PurchaseOrderForm';
import { PurchaseOrderDetails } from '@/pages/purchase-orders/PurchaseOrderDetails';
import { SalesOrderList } from '@/pages/sales-orders/SalesOrderList';
import { SalesOrderForm } from '@/pages/sales-orders/SalesOrderForm';
import { SalesOrderDetails } from '@/pages/sales-orders/SalesOrderDetails';
import { InvoicesList } from '@/pages/finance/InvoicesList';
import { InvoiceDetails } from '@/pages/finance/InvoiceDetails';
import { BillsList } from '@/pages/finance/BillsList';
import { BillDetails } from '@/pages/finance/BillDetails';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { Unauthorized } from '@/pages/auth/Unauthorized';
import { Forbidden } from '@/pages/auth/Forbidden';
import { NetworkError } from '@/pages/auth/NetworkError';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductsList } from '@/pages/products/ProductsList';
import { ProductDetails } from '@/pages/products/ProductDetails';
import { InventoryDashboard } from '@/pages/inventory/InventoryDashboard';
import { CycleCounts } from '@/pages/inventory/CycleCounts';
import { WarehousesList } from '@/pages/warehouses/WarehousesList';
import { WarehouseDetails } from '@/pages/warehouses/WarehouseDetails';
import { SuppliersList } from '@/pages/suppliers/SuppliersList';
import { SupplierDetails } from '@/pages/suppliers/SupplierDetails';
import { CustomersList } from '@/pages/customers/CustomersList';
import { CustomerDetails } from '@/pages/customers/CustomerDetails';
import { Signup } from '@/pages/auth/Signup';
import { VerifyEmail } from '@/pages/onboarding/VerifyEmail';
import { CreateWorkspace } from '@/pages/onboarding/CreateWorkspace';
import { WorkspaceIndustry } from '@/pages/onboarding/WorkspaceIndustry';
import { WorkspaceInvite } from '@/pages/onboarding/WorkspaceInvite';
import { SettingsLayout } from '@/pages/settings/SettingsLayout';
import { WorkspaceSettings } from '@/pages/settings/WorkspaceSettings';
import { TeamSettings } from '@/pages/settings/TeamSettings';
import { SecuritySettings } from '@/pages/settings/SecuritySettings';
import { ProfileSettings } from '@/pages/settings/ProfileSettings';
import { BillingSettings } from '@/pages/settings/BillingSettings';
import { AutomationSettings } from '@/pages/settings/AutomationSettings';
import { IntegrationsSettings } from '@/pages/settings/IntegrationsSettings';
import { InvitationAcceptance } from '@/pages/onboarding/InvitationAcceptance';

// New business feature views
import { PurchaseReturnList } from '@/pages/purchase-returns/PurchaseReturnList';
import { PurchaseReturnForm } from '@/pages/purchase-returns/PurchaseReturnForm';
import { PurchaseReturnDetails } from '@/pages/purchase-returns/PurchaseReturnDetails';
import { SalesReturnList } from '@/pages/sales-returns/SalesReturnList';
import { SalesReturnForm } from '@/pages/sales-returns/SalesReturnForm';
import { SalesReturnDetails } from '@/pages/sales-returns/SalesReturnDetails';
import { QuotationList } from '@/pages/quotations/QuotationList';
import { QuotationForm } from '@/pages/quotations/QuotationForm';
import { QuotationDetails } from '@/pages/quotations/QuotationDetails';
import { ExpiringStock } from '@/pages/inventory/ExpiringStock';
import { TaxRulesSettings } from '@/pages/settings/TaxRulesSettings';
import { DemoSettings } from '@/pages/settings/DemoSettings';


import { useAuthStore } from '@/store/auth';

function App() {
  const { checkAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    checkAuth().finally(() => setIsInitializing(false));
  }, [checkAuth]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg select-none">
          SF
        </div>
        <div className="space-y-2 w-48">
          <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-2 w-3/4 animate-pulse rounded-full bg-muted" />
          <div className="h-2 w-1/2 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <AppProviders>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Onboarding Routes - In a real app these might have a specific ProtectedRoute variant */}
            <Route path="/onboarding/verify-email" element={<VerifyEmail />} />
            <Route path="/onboarding/workspace" element={<CreateWorkspace />} />
            <Route path="/onboarding/industry" element={<WorkspaceIndustry />} />
            <Route path="/onboarding/invite" element={<WorkspaceInvite />} />
          </Route>

          <Route element={<BlankLayout />}>
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="/network-error" element={<NetworkError />} />
          </Route>

          {/* Development / Testing */}
          <Route path="/design-system" element={<DesignSystemShowcase />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              
              {/* Product Management */}
              <Route path="/products" element={<ProductsList />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              
              {/* Inventory Management */}
              <Route path="/inventory" element={<InventoryDashboard />} />
              <Route path="/inventory/cycle-counts" element={<CycleCounts />} />
              <Route path="/inventory/expiring" element={<ExpiringStock />} />
              <Route path="/warehouses" element={<WarehousesList />} />
              <Route path="/warehouses/:id" element={<WarehouseDetails />} />

              {/* CRM / Suppliers */}
              <Route path="/suppliers" element={<SuppliersList />} />
              <Route path="/suppliers/:id" element={<SupplierDetails />} />
              <Route path="/customers" element={<CustomersList />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />

              {/* Purchase Orders */}
              <Route path="/purchase-orders" element={<PurchaseOrderList />} />
              <Route path="/purchase-orders/new" element={<PurchaseOrderForm />} />
              <Route path="/purchase-orders/:id" element={<PurchaseOrderDetails />} />
              <Route path="/purchase-returns" element={<PurchaseReturnList />} />
              <Route path="/purchase-returns/new" element={<PurchaseReturnForm />} />
              <Route path="/purchase-returns/:id" element={<PurchaseReturnDetails />} />

              {/* Sales Orders */}
              <Route path="/sales-orders" element={<SalesOrderList />} />
              <Route path="/sales-orders/new" element={<SalesOrderForm />} />
              <Route path="/sales-orders/:id" element={<SalesOrderDetails />} />
              <Route path="/sales-returns" element={<SalesReturnList />} />
              <Route path="/sales-returns/new" element={<SalesReturnForm />} />
              <Route path="/sales-returns/:id" element={<SalesReturnDetails />} />

              {/* Quotations */}
              <Route path="/quotations" element={<QuotationList />} />
              <Route path="/quotations/new" element={<QuotationForm />} />
              <Route path="/quotations/:id" element={<QuotationDetails />} />

              {/* Finance */}
              <Route path="/finance/invoices" element={<InvoicesList />} />
              <Route path="/finance/invoices/:id" element={<InvoiceDetails />} />
              <Route path="/finance/bills" element={<BillsList />} />
              <Route path="/finance/bills/:id" element={<BillDetails />} />
              {/* Settings */}
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="/settings/workspace" replace />} />
                <Route path="workspace" element={<WorkspaceSettings />} />
                <Route path="team" element={<TeamSettings />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="billing" element={<BillingSettings />} />
                <Route path="automation" element={<AutomationSettings />} />
                <Route path="integrations" element={<IntegrationsSettings />} />
                <Route path="tax-rules" element={<TaxRulesSettings />} />
                <Route path="demo" element={<DemoSettings />} />
              </Route>
            </Route>
          </Route>

          {/* Invitation Acceptance (Public/Protected hybrid) */}
          <Route path="/invite/:token" element={<InvitationAcceptance />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/unauthorized" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
