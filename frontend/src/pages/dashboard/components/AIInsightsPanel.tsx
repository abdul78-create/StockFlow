import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Sparkles } from 'lucide-react';

export function AIInsightsPanel() {
  return (
    <Card className="col-span-full xl:col-span-1 shadow-sm h-full flex flex-col bg-gradient-to-b from-indigo-500/5 to-card border-indigo-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
          <Sparkles className="h-5 w-5" />
          AI Insights
        </CardTitle>
        <CardDescription>Intelligent recommendations</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <EmptyState
          icon={Sparkles}
          title="No recommendations yet"
          description="Recommendations will appear after sufficient inventory and sales history is available."
          className="border-none shadow-none bg-transparent py-10"
        />
      </CardContent>
    </Card>
  );
}
