'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { formatPrice } from '@/lib/utils';

interface DepreciationChartProps {
  data: Array<{
    age: number;
    median: number;
    mean: number;
    count: number;
  }>;
}

export function DepreciationChart({ data }: DepreciationChartProps) {
  const chartData = data
    .filter(d => d.age >= 0 && d.age <= 15 && d.count >= 100)
    .map(d => ({
      age: `${d.age} yr`,
      years: d.age,
      price: Math.round(d.median),
    }));

  if (chartData.length < 3) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
        Not enough data for depreciation chart
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickFormatter={(value) => `$${value / 1000}k`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            formatter={(value: number) => [formatPrice(value), 'Median Price']}
            labelFormatter={(label) => `Vehicle Age: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#22c55e"
            strokeWidth={3}
            fill="url(#priceGradient)"
            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#16a34a' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
