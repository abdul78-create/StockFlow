import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AreaChart, type AreaChartProps } from './area-chart';
import { BarChart, type BarChartProps } from './bar-chart';
import { LineChart, type LineChartProps } from './line-chart';
import { PieChart, type PieChartProps } from './pie-chart';

type ChartType = 'area' | 'line' | 'bar' | 'pie';

export interface StatChartProps {
  title: string;
  description?: string;
  type: ChartType;
  loading?: boolean;
  className?: string;
  chartProps:
    | ({ type: 'area' } & AreaChartProps)
    | ({ type: 'line' } & LineChartProps)
    | ({ type: 'bar' } & BarChartProps)
    | ({ type: 'pie' } & PieChartProps);
}

export function StatChart({
  title,
  description,
  type,
  loading,
  className,
  chartProps,
}: StatChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'area':
        return <AreaChart {...(chartProps as AreaChartProps)} />;
      case 'line':
        return <LineChart {...(chartProps as LineChartProps)} />;
      case 'bar':
        return <BarChart {...(chartProps as BarChartProps)} />;
      case 'pie':
        return <PieChart {...(chartProps as PieChartProps)} />;
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-[300px] w-full" /> : renderChart()}
      </CardContent>
    </Card>
  );
}

export { AreaChart, LineChart, BarChart, PieChart };
