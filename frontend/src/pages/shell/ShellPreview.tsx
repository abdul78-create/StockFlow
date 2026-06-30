import * as React from 'react';
import { PageTemplate } from '../../components/layout/PageTemplate';
import { Button } from '../../components/ui/button';
import { Icons } from '../../lib/icons';
import { StatCard } from '../../components/ui/stat-card';
import { motion } from 'framer-motion';
import { pageTransition, interact } from '../../lib/motion';
import { useSalesOrders } from '../../lib/hooks/useSalesOrders';
import { usePurchaseOrders } from '../../lib/hooks/usePurchaseOrders';
import { useStockHealth } from '../../lib/hooks/useInventory';
import { QueryStateWrapper } from '../../components/ui/query-state-wrapper';

export function ShellPreview() {
  const { data: sales, isLoading: isSalesLoading, error: salesError } = useSalesOrders({ limit: 1 });
  const { data: purchases, isLoading: isPurchasesLoading, error: purchasesError } = usePurchaseOrders({ limit: 1 });
  const { data: health, isLoading: isHealthLoading, error: healthError } = useStockHealth();

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <PageTemplate
        title="Dashboard Overview"
        subtitle="Live metrics from your business operations"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Dashboard' },
        ]}
        actions={
          <>
            <motion.div variants={interact} whileHover="hover" whileTap="tap">
              <Button variant="outline">
                <Icons.download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </motion.div>
            <motion.div variants={interact} whileHover="hover" whileTap="tap">
              <Button>
                <Icons.add className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </motion.div>
          </>
        }
      >
        <QueryStateWrapper
          isLoading={isSalesLoading || isPurchasesLoading || isHealthLoading}
          error={salesError || purchasesError || healthError}
          data={{ sales, purchases, health }}
          isEmpty={(d) => false}
        >
          {({ sales: sData, purchases: pData, health: hData }) => (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Inventory Value"
                  value={`$${(hData?.totalValue || 0).toLocaleString()}`}
                  description="Total stock worth"
                  icon={Icons.inventory}
                  trend={{ value: 2.1 }}
                />
                <StatCard
                  title="Total Sales Orders"
                  value={sData?.total?.toString() || "0"}
                  description="All recorded sales"
                  icon={Icons.salesOrders}
                  trend={{ value: 5.4 }}
                />
                <StatCard
                  title="Low Stock Alerts"
                  value={hData?.lowStockCount?.toString() || "0"}
                  description="Items needing replenishment"
                  icon={Icons.warning}
                  trend={{ value: (hData?.lowStockCount || 0) > 5 ? -15 : 0 }}
                />
                <StatCard
                  title="Total Purchase Orders"
                  value={pData?.total?.toString() || "0"}
                  description="Incoming replenishments"
                  icon={Icons.purchaseOrders}
                  trend={{ value: 1.2 }}
                />
              </div>

              <div className="mt-6 h-96 rounded-xl border bg-card text-card-foreground shadow-sm flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <Icons.trendUp className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium">Advanced Reports Coming Soon</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Phase 8 will introduce real-time charts, revenue forecasting, and detailed sales analytics right here on your dashboard.
                  </p>
                </div>
              </div>
            </>
          )}
        </QueryStateWrapper>
      </PageTemplate>
    </motion.div>
  );
}
