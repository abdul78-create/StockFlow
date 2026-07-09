import * as React from 'react';
import { useDashboardMetrics, DashboardMetrics } from '@/lib/hooks/useDashboard';
import { DashboardSkeleton } from '@/components/ui/page-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { OnboardingChecklist } from '@/components/OnboardingChecklist';

import { WelcomeHeader } from './components/WelcomeHeader';
import { ExecutiveKpis } from './components/ExecutiveKpis';
import { SalesAnalytics } from './components/SalesAnalytics';
import { InventoryAnalytics } from './components/InventoryAnalytics';
import { RecentActivity } from './components/RecentActivity';
import { TopProductsPanel } from './components/TopProductsPanel';
import { RecentCustomersPanel } from './components/RecentCustomersPanel';
import { QuickActions } from './components/QuickActions';
import { OrderPipeline } from './components/OrderPipeline';
import { WorkspaceHealth } from './components/WorkspaceHealth';
import { AIInsightsPanel } from './components/AIInsightsPanel';

export function DashboardPage() {
  const { data: metrics, isLoading, error, refetch } = useDashboardMetrics();

  if (isLoading) return <DashboardSkeleton />;

  if (error || !metrics) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <ErrorState
          title="Couldn't load dashboard"
          message="We couldn't fetch your dashboard data. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return <DashboardContent metrics={metrics} />;
}

function DashboardContent({
  metrics,
}: {
  metrics: DashboardMetrics;
}) {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-300">
      <WelcomeHeader />
      
      <OnboardingChecklist />

      <QuickActions />

      <ExecutiveKpis metrics={metrics} />

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <SalesAnalytics metrics={metrics} />
        <InventoryAnalytics metrics={metrics} />
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <TopProductsPanel metrics={metrics} />
        <RecentCustomersPanel metrics={metrics} />
        <RecentActivity metrics={metrics} />
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <OrderPipeline />
        <WorkspaceHealth />
        <AIInsightsPanel />
      </div>
    </div>
  );
}

