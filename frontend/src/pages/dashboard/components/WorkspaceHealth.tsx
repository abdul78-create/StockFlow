import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/lib/icons';
import { Activity } from 'lucide-react';

export function WorkspaceHealth() {
  return (
    <Card className="col-span-full xl:col-span-1 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Workspace Health
        </CardTitle>
      </CardHeader>
      <CardContent>
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
