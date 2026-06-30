import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { DesignSystemShowcase } from '@/pages/design-system/DesignSystemShowcase';

import { DashboardLayout } from '@/components/layout/layouts/DashboardLayout';
import { ShellPreview } from '@/pages/shell/ShellPreview';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/shell-preview" replace />} />
          <Route path="/design-system" element={<DesignSystemShowcase />} />
          <Route element={<DashboardLayout />}>
            <Route path="/shell-preview" element={<ShellPreview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
