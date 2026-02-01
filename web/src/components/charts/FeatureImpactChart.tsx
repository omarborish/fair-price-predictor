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
  ReferenceLine,
} from 'recharts';
import { FeatureImpact } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface FeatureImpactChartProps {
  impacts: FeatureImpact[];
}

export function FeatureImpactChart({ impacts }: FeatureImpactChartProps) {
  const chartData = impacts.map(impact => ({
    name: impact.feature,
    value: impact.impact_value,
    direction: impact.direction,
  }));

  if (impacts.length === 0) return null;

  return (
    <div className="h-48 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickFormatter={(value) => `$${Math.abs(value / 1000)}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            formatter={(value: number) => [
              `${value >= 0 ? '+' : ''}${formatPrice(value)}`,
              'Impact',
            ]}
          />
          <ReferenceLine x={0} stroke="#94a3b8" />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.direction === 'positive' ? '#22c55e' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
