'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatPrice } from '@/lib/utils';

interface MileageImpactChartProps {
  data: Array<{
    mileage_band: string;
    median: number;
    mean: number;
    count: number;
  }>;
}

const colors = ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#f97316', '#ef4444'];

export function MileageImpactChart({ data }: MileageImpactChartProps) {
  const chartData = data
    .filter(d => d.count >= 100)
    .map(d => ({
      mileage: d.mileage_band,
      price: Math.round(d.median),
    }));

  if (chartData.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
        Not enough data for mileage chart
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="mileage"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            formatter={(value: number) => [formatPrice(value), 'Median Price']}
          />
          <Bar dataKey="price" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
