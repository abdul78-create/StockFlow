import * as React from 'react';
import { PageTemplate } from '../../components/layout/PageTemplate';
import { Button } from '../../components/ui/button';
import { Icons } from '../../lib/icons';
import { StatCard } from '../../components/ui/stat-card';
import { motion } from 'framer-motion';
import { pageTransition, interact } from '../../lib/motion';

export function ShellPreview() {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <PageTemplate
        title="Dashboard"
        subtitle="Overview of your business metrics"
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="$45,231.89"
            description="+20.1% from last month"
            icon={Icons.trendUp}
            trend={{ value: 20.1 }}
          />
          <StatCard
            title="Active Orders"
            value="356"
            description="+12 since last hour"
            icon={Icons.salesOrders}
            trend={{ value: 3.5 }}
          />
          <StatCard
            title="Low Stock Items"
            value="12"
            description="Needs immediate attention"
            icon={Icons.warning}
            trend={{ value: -15 }}
          />
          <StatCard
            title="Active Customers"
            value="2,345"
            description="+180 this week"
            icon={Icons.customers}
            trend={{ value: 8.3 }}
          />
        </div>

        <div className="mt-6 h-96 rounded-xl border bg-card text-card-foreground shadow-sm flex items-center justify-center">
          <p className="text-muted-foreground">Chart Placeholder</p>
        </div>
      </PageTemplate>
    </motion.div>
  );
}
