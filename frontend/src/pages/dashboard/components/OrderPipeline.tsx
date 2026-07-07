import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/lib/icons';

export function OrderPipeline() {
  return (
    <Card className="col-span-full xl:col-span-1 shadow-sm">
      <CardHeader>
        <CardTitle>Order Pipeline</CardTitle>
        <CardDescription>Live tracking of active orders</CardDescription>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={Icons.truck}
          title="Pipeline currently unavailable"
          description="Order pipeline analytics will appear here as transactions are processed. This feature requires the advanced analytics backend module."
          className="border-none shadow-none bg-transparent py-10"
        />
      </CardContent>
    </Card>
  );
}
