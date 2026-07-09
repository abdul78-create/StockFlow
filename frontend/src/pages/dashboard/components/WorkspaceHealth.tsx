import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Activity } from 'lucide-react';

export function WorkspaceHealth() {
  return (
    <Card className="col-span-full xl:col-span-1 shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          Workspace Health
        </CardTitle>
        <CardDescription>Live health metrics</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <EmptyState
          icon={Activity}
          title="Health metrics unavailable"
          description="Workspace health metrics are not yet configured for this environment."
          className="border-none shadow-none bg-transparent py-10"
        />
      </CardContent>
    </Card>
  );
}
