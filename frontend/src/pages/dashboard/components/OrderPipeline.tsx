import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Truck } from 'lucide-react';

export function OrderPipeline() {
  return (
    <Card className="col-span-full xl:col-span-1 shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-muted-foreground" />
          Order Pipeline
        </CardTitle>
        <CardDescription>Live tracking of active orders</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <EmptyState
          icon={Truck}
          title="Pipeline currently unavailable"
          description="Order pipeline analytics will appear here as transactions are processed. This feature requires the advanced analytics backend module."
          className="border-none shadow-none bg-transparent py-10"
        />
      </CardContent>
    </Card>
  );
}
