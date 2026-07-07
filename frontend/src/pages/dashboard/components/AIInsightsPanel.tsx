import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/lib/icons';
import { Sparkles } from 'lucide-react';

export function AIInsightsPanel() {
  return (
    <Card className="col-span-full xl:col-span-1 shadow-sm bg-gradient-to-b from-indigo-500/5 to-card border-indigo-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
          <Sparkles className="h-5 w-5" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={Sparkles}
          title="No recommendations yet."
          description="Recommendations will appear after sufficient inventory and sales history is available."
          className="border-none shadow-none bg-transparent py-10"
        />
      </CardContent>
    </Card>
  );
}
