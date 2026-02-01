'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatPrice, titleCase } from '@/lib/utils';

interface ManufacturerChartProps {
  data: Array<{
    manufacturer: string;
    median: number;
    mean: number;
    count: number;
  }>;
}

export function ManufacturerChart({ data }: ManufacturerChartProps) {
  const chartData = data
    .filter(d => d.count >= 500)
    .sort((a, b) => b.median - a.median)
    .slice(0, 15)
    .map(d => ({
      name: titleCase(d.manufacturer),
      price: Math.round(d.median),
      count: d.count,
    }));

  if (chartData.length < 3) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
        Not enough data for manufacturer chart
      </div>
    );
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            formatter={(value: number, name: string, props: any) => [
              formatPrice(value),
              'Median Price',
            ]}
          />
          <Bar dataKey="price" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
