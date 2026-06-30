import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { ChartDataPoint } from './area-chart';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--text-secondary))',
  'hsl(var(--border))',
  'hsl(var(--success))',
  'hsl(var(--info))',
];

export interface PieChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  nameKey: string;
  height?: number;
  className?: string;
  colors?: string[];
}

export function PieChart({
  data,
  dataKey,
  nameKey,
  height = 300,
  className,
  colors = CHART_COLORS,
}: PieChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius-md)',
              fontSize: 12,
            }}
          />
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
