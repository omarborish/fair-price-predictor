'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { ComparableCar } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface PriceDistributionChartProps {
  comparables: ComparableCar[];
  predictedPrice: number;
}

export function PriceDistributionChart({ comparables, predictedPrice }: PriceDistributionChartProps) {
  const chartData = useMemo(() => {
    if (comparables.length === 0) return [];

    const prices = comparables.map(c => c.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const binCount = Math.min(8, comparables.length);
    const binSize = range / binCount;

    const bins: { range: string; count: number; minVal: number; maxVal: number }[] = [];

    for (let i = 0; i < binCount; i++) {
      const binMin = minPrice + i * binSize;
      const binMax = binMin + binSize;
      const count = prices.filter(p => p >= binMin && (i === binCount - 1 ? p <= binMax : p < binMax)).length;
      
      bins.push({
        range: `$${Math.round(binMin / 1000)}k-$${Math.round(binMax / 1000)}k`,
        count,
        minVal: binMin,
        maxVal: binMax,
      });
    }

    return bins;
  }, [comparables]);

  const predictedBinIndex = useMemo(() => {
    return chartData.findIndex(
      bin => predictedPrice >= bin.minVal && predictedPrice <= bin.maxVal
    );
  }, [chartData, predictedPrice]);

  if (comparables.length < 3) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 dark:text-slate-400">
        Not enough data for distribution chart
      </div>
    );
  }

  return (
    <div className="h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="range" 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            formatter={(value: number) => [`${value} cars`, 'Count']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === predictedBinIndex ? '#22c55e' : '#3b82f6'} 
              />
            ))}
          </Bar>
          <ReferenceLine
            x={chartData[predictedBinIndex]?.range}
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: 'Your car',
              position: 'top',
              fill: '#22c55e',
              fontSize: 12,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
        Your estimated price ({formatPrice(predictedPrice)}) is highlighted in green
      </p>
    </div>
  );
}
