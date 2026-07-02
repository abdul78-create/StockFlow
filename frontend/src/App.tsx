import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
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
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { Unauthorized } from '@/pages/auth/Unauthorized';
import { Forbidden } from '@/pages/auth/Forbidden';
import { NetworkError } from '@/pages/auth/NetworkError';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductsList } from '@/pages/products/ProductsList';
import { ProductDetails } from '@/pages/products/ProductDetails';
import { InventoryDashboard } from '@/pages/inventory/InventoryDashboard';
import { WarehousesList } from '@/pages/warehouses/WarehousesList';
import { SuppliersList } from '@/pages/suppliers/SuppliersList';
import { CustomersList } from '@/pages/customers/CustomersList';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
              <Route path="/warehouses" element={<WarehousesList />} />

              {/* CRM / Suppliers */}
              <Route path="/suppliers" element={<SuppliersList />} />
              <Route path="/customers" element={<CustomersList />} />

              {/* Purchase Orders */}
              <Route path="/purchase-orders" element={<PurchaseOrderList />} />
              <Route path="/purchase-orders/new" element={<PurchaseOrderForm />} />
              <Route path="/purchase-orders/:id" element={<PurchaseOrderDetails />} />

              {/* Sales Orders */}
              <Route path="/sales-orders" element={<SalesOrderList />} />
              <Route path="/sales-orders/new" element={<SalesOrderForm />} />
              <Route path="/sales-orders/:id" element={<SalesOrderDetails />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/unauthorized" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
