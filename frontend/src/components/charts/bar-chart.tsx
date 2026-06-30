import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type CartesianGridProps,
  type XAxisProps,
  type YAxisProps,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { ChartDataPoint } from './area-chart';

export interface BarChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  xAxisKey: string;
  height?: number;
  className?: string;
  color?: string;
  showGrid?: boolean;
  gridProps?: CartesianGridProps;
  xAxisProps?: XAxisProps;
  yAxisProps?: YAxisProps;
}

const defaultGrid: CartesianGridProps = {
  strokeDasharray: '3 3',
  stroke: 'hsl(var(--border))',
};

const defaultAxis = {
  stroke: 'hsl(var(--text-secondary))',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

export function BarChart({
  data,
  dataKey,
  xAxisKey,
  height = 300,
  className,
  color = 'hsl(var(--primary))',
  showGrid = true,
  gridProps,
  xAxisProps,
  yAxisProps,
}: BarChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid {...defaultGrid} {...gridProps} />}
          <XAxis dataKey={xAxisKey} {...defaultAxis} {...xAxisProps} />
          <YAxis {...defaultAxis} {...yAxisProps} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius-md)',
              fontSize: 12,
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
