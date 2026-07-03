import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { useSubscription, useUpgradeSubscription } from '@/lib/hooks/useBilling';
import { Loader2, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: '$0',
    description: 'Perfect for small businesses just getting started.',
    features: ['1 Warehouse', 'Up to 100 Products', 'Basic Reporting', 'Community Support'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$49/mo',
    description: 'Everything you need to scale your inventory operations.',
    features: ['3 Warehouses', 'Unlimited Products', 'Advanced Reporting', 'Priority Email Support'],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: '$199/mo',
    description: 'Advanced capabilities for complex supply chains.',
    features: ['Unlimited Warehouses', 'Custom Roles & Permissions', 'API Access', '24/7 Phone Support'],
  },
];

export function BillingSettings() {
  const { data: subscription, isLoading } = useSubscription();
  const upgradeMutation = useUpgradeSubscription();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Billing & Plans</h3>
          <p className="text-sm text-muted-foreground">Manage your subscription and billing details.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col space-y-3 rounded-xl border p-6">
              <Skeleton className="h-6 w-[120px]" />
              <Skeleton className="h-4 w-full" />
              <div className="pt-4">
                <Skeleton className="h-10 w-[80px]" />
              </div>
              <div className="space-y-2 pt-4 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'STARTER';

  const handleUpgrade = (planId: 'PRO' | 'ENTERPRISE') => {
    upgradeMutation.mutate(planId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing & Plans</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isDowngrade = PLANS.findIndex((p) => p.id === currentPlan) > PLANS.findIndex((p) => p.id === plan.id);

          return (
            <Card key={plan.id} className={isCurrent ? 'border-primary shadow-sm' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge variant="default">Current Plan</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">{plan.price}</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Active Plan
                  </Button>
                ) : isDowngrade ? (
                  <Button variant="outline" className="w-full" disabled>
                    Downgrade Contact Support
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(plan.id as 'PRO' | 'ENTERPRISE')}
                    disabled={upgradeMutation.isPending}
                  >
                    {upgradeMutation.isPending && upgradeMutation.variables === plan.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Upgrade to {plan.name}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>View your current subscription status and renewal date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'destructive'}>
                    {subscription.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Period Ends</p>
                <p className="mt-1 text-sm">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
