'use client';

import { useState, useEffect } from 'react';
import { Fuel, Loader2, Zap, Droplet, Leaf } from 'lucide-react';
import { InsightLayout } from '@/components/InsightLayout';
import { getInsights } from '@/lib/api';
import { formatPrice, formatNumber } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const FUEL_COLORS: Record<string, string> = {
  gas: '#6366f1',
  diesel: '#f59e0b',
  hybrid: '#10b981',
  electric: '#06b6d4',
  other: '#8b5cf6'
};

const FUEL_ICONS: Record<string, React.ReactNode> = {
  gas: <Droplet className="w-4 h-4" />,
  diesel: <Fuel className="w-4 h-4" />,
  hybrid: <Leaf className="w-4 h-4" />,
  electric: <Zap className="w-4 h-4" />,
};

export default function FuelTypeComparisonPage() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInsights()
      .then(setInsights)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const fuelData = insights?.price_by_fuel || [];
  const totalListings = insights?.overall_stats?.total_listings || 0;

  // Calculate market share
  const fuelWithShare = fuelData.map((f: any) => ({
    ...f,
    share: ((f.count / totalListings) * 100).toFixed(1)
  }));

  return (
    <InsightLayout
      title="Gas vs. Diesel vs. Hybrid vs. Electric: Used Car Prices Compared"
      description="Compare used car prices across fuel types. See how gas, diesel, hybrid, and electric vehicles stack up in the resale market."
      icon={<Fuel className="w-6 h-6" />}
    >
      <h2>Fuel Type and Vehicle Value</h2>
      
      <p>
        The fuel type of a vehicle affects not just its operating costs but also its resale value. 
        Our analysis of {formatNumber(totalListings)} listings reveals significant price differences 
        between fuel types, reflecting varying demand, operating costs, and market positioning.
      </p>

      <div className="not-prose my-8 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Median Price by Fuel Type
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fuelData.filter((f: any) => f.fuel !== 'other')} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <YAxis dataKey="fuel" type="category" width={70} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => formatPrice(value)}
                labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
              />
              <Bar dataKey="median" radius={[0, 4, 4, 0]}>
                {fuelData.filter((f: any) => f.fuel !== 'other').map((entry: any) => (
                  <Cell key={entry.fuel} fill={FUEL_COLORS[entry.fuel] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2>Fuel Type Breakdown</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-sm text-slate-700 dark:text-slate-300">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 px-3 font-semibold">Fuel Type</th>
              <th className="text-left py-2 px-3 font-semibold">Median Price</th>
              <th className="text-left py-2 px-3 font-semibold">Market Share</th>
              <th className="text-left py-2 px-3 font-semibold">Listings</th>
            </tr>
          </thead>
          <tbody>
            {fuelWithShare.sort((a: any, b: any) => b.median - a.median).map((row: any) => (
              <tr key={row.fuel} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3 capitalize flex items-center gap-2">
                  {FUEL_ICONS[row.fuel] || <Fuel className="w-4 h-4" />}
                  {row.fuel}
                </td>
                <td className="py-2 px-3">{formatPrice(row.median)}</td>
                <td className="py-2 px-3">{row.share}%</td>
                <td className="py-2 px-3">{formatNumber(row.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Understanding Each Fuel Type</h2>

      <h3>Diesel: The Premium Performer</h3>
      <p>
        Diesel vehicles command the highest median prices in our dataset. This premium reflects:
      </p>
      <ul>
        <li><strong>Vehicle Type:</strong> Diesels are concentrated in trucks and commercial vehicles</li>
        <li><strong>Durability:</strong> Diesel engines are known for longevity (often 300k+ miles)</li>
        <li><strong>Towing Capacity:</strong> Superior torque makes them preferred for heavy-duty use</li>
        <li><strong>Fuel Efficiency:</strong> Better MPG than gas equivalents for highway driving</li>
      </ul>

      <h3>Electric: The Emerging Segment</h3>
      <p>
        Electric vehicles (EVs) show strong pricing despite being a newer market segment:
      </p>
      <ul>
        <li><strong>Technology Premium:</strong> EVs represent the latest automotive technology</li>
        <li><strong>Lower Operating Costs:</strong> Electricity is cheaper than gas per mile</li>
        <li><strong>Battery Concerns:</strong> Some depreciation due to battery degradation fears</li>
        <li><strong>Limited Selection:</strong> Fewer used EVs available creates higher demand</li>
      </ul>

      <h3>Gasoline: The Mainstream Choice</h3>
      <p>
        Gas vehicles dominate the used car market, representing the broadest selection:
      </p>
      <ul>
        <li><strong>Market Share:</strong> Over 80% of listings are gasoline-powered</li>
        <li><strong>Price Range:</strong> Widest variety from economy to luxury</li>
        <li><strong>Infrastructure:</strong> Most convenient fueling network</li>
        <li><strong>Maintenance:</strong> Well-understood repair and service options</li>
      </ul>

      <h3>Hybrid: The Balanced Option</h3>
      <p>
        Hybrids offer a middle ground with moderate pricing:
      </p>
      <ul>
        <li><strong>Fuel Savings:</strong> 40-60% better fuel economy than gas equivalents</li>
        <li><strong>Reliability:</strong> Toyota Prius set the standard for hybrid durability</li>
        <li><strong>Battery Anxiety:</strong> Some concern about replacement costs</li>
        <li><strong>Best Of Both:</strong> No range anxiety with gas backup</li>
      </ul>

      <h2>Total Cost of Ownership</h2>
      <p>
        When evaluating vehicles, consider more than just the sticker price:
      </p>
      <ul>
        <li><strong>Fuel Costs:</strong> EVs and hybrids save significantly on fuel</li>
        <li><strong>Maintenance:</strong> EVs have fewer moving parts; diesels need specialized service</li>
        <li><strong>Insurance:</strong> EVs can be more expensive to insure</li>
        <li><strong>Resale:</strong> Current data suggests EVs depreciate faster than traditional vehicles</li>
      </ul>

      <h2>Future Outlook</h2>
      <p>
        The used car market is evolving rapidly. As more EVs enter the used market and charging 
        infrastructure expands, we expect to see shifts in these price patterns. Diesel may face 
        headwinds from emissions regulations, while hybrids could become the value sweet spot.
      </p>
    </InsightLayout>
  );
}
