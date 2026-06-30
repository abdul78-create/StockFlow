import {
  Area,
  AreaChart as RechartsAreaChart,
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

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface AreaChartProps {
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

export function AreaChart({
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
}: AreaChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.08}
            strokeWidth={2}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
