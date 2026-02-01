'use client';

import { useState, useEffect } from 'react';
import { Settings, Loader2 } from 'lucide-react';
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export default function DrivetrainPremiumPage() {
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

  const driveData = insights?.price_by_drive || [];
  const transmissionData = insights?.price_by_transmission || [];

  // Calculate premiums relative to FWD
  const fwdPrice = driveData.find((d: any) => d.drive === 'fwd')?.median || 10000;
  const driveWithPremium = driveData.map((d: any) => ({
    ...d,
    premium: Math.round(((d.median - fwdPrice) / fwdPrice) * 100)
  }));

  return (
    <InsightLayout
      title="Drivetrain Premium: AWD, 4WD, FWD, and RWD Price Differences"
      description="See how drivetrain configuration affects used car prices. Understand the real-world premium for AWD and 4WD vehicles."
      icon={<Settings className="w-6 h-6" />}
    >
      <h2>How Drivetrain Affects Vehicle Value</h2>
      
      <p>
        Your vehicle's drivetrain—whether it's front-wheel drive (FWD), rear-wheel drive (RWD), 
        all-wheel drive (AWD), or four-wheel drive (4WD)—significantly impacts its resale value. 
        Our analysis reveals substantial price differences between configurations.
      </p>

      <div className="not-prose my-8 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Median Price by Drivetrain
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={driveData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <YAxis dataKey="drive" type="category" width={60} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => formatPrice(value)}
                labelFormatter={(label) => label.toUpperCase()}
              />
              <Bar dataKey="median" radius={[0, 4, 4, 0]}>
                {driveData.map((_: any, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2>The Numbers</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-sm text-slate-700 dark:text-slate-300">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 px-3 font-semibold">Drivetrain</th>
              <th className="text-left py-2 px-3 font-semibold">Median Price</th>
              <th className="text-left py-2 px-3 font-semibold">Premium vs FWD</th>
              <th className="text-left py-2 px-3 font-semibold">Listings</th>
            </tr>
          </thead>
          <tbody>
            {driveWithPremium.map((row: any) => (
              <tr key={row.drive} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3 uppercase font-medium">{row.drive}</td>
                <td className="py-2 px-3">{formatPrice(row.median)}</td>
                <td className="py-2 px-3">
                  {row.premium > 0 ? (
                    <span className="text-green-600">+{row.premium}%</span>
                  ) : row.premium < 0 ? (
                    <span className="text-red-600">{row.premium}%</span>
                  ) : (
                    <span className="text-slate-500">Baseline</span>
                  )}
                </td>
                <td className="py-2 px-3">{formatNumber(row.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Understanding Each Drivetrain</h2>

      <h3>Four-Wheel Drive (4WD)</h3>
      <p>
        4WD commands the highest premium in our dataset. This configuration is most common in trucks 
        and SUVs, which are already higher-priced segments. 4WD systems are valued for:
      </p>
      <ul>
        <li>Off-road capability and traction in challenging conditions</li>
        <li>Towing capacity and heavy-duty applications</li>
        <li>Higher perceived durability and ruggedness</li>
        <li>Strong demand in regions with harsh winters</li>
      </ul>

      <h3>Rear-Wheel Drive (RWD)</h3>
      <p>
        RWD vehicles also command a premium, though for different reasons. This configuration is 
        common in:
      </p>
      <ul>
        <li>Luxury sedans and sports cars</li>
        <li>Performance-oriented vehicles</li>
        <li>Full-size trucks</li>
      </ul>
      <p>
        The premium reflects the types of vehicles that use RWD rather than the drivetrain itself 
        being inherently more valuable.
      </p>

      <h3>Front-Wheel Drive (FWD)</h3>
      <p>
        FWD is the most common and affordable configuration. It offers:
      </p>
      <ul>
        <li>Better fuel efficiency</li>
        <li>Lower manufacturing and repair costs</li>
        <li>Adequate traction for most driving conditions</li>
        <li>More interior space due to simpler drivetrain packaging</li>
      </ul>

      <h2>Transmission Impact</h2>

      <p>
        Transmission type also affects pricing, though the relationship is more nuanced:
      </p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-sm text-slate-700 dark:text-slate-300">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 px-3 font-semibold">Transmission</th>
              <th className="text-left py-2 px-3 font-semibold">Median Price</th>
              <th className="text-left py-2 px-3 font-semibold">Listings</th>
            </tr>
          </thead>
          <tbody>
            {transmissionData.map((row: any) => (
              <tr key={row.transmission} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3 capitalize">{row.transmission}</td>
                <td className="py-2 px-3">{formatPrice(row.median)}</td>
                <td className="py-2 px-3">{formatNumber(row.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Regional Considerations</h2>
      <p>
        Drivetrain premiums vary significantly by region. In areas with heavy snowfall, 4WD and AWD 
        vehicles command even higher premiums. In warm climates, the premium is smaller or non-existent.
      </p>

      <h2>Buying Advice</h2>
      <ul>
        <li><strong>For cold climates:</strong> The 4WD/AWD premium is often worth it for safety and convenience</li>
        <li><strong>For mild climates:</strong> FWD offers the best value for daily driving</li>
        <li><strong>For performance:</strong> RWD provides the best driving dynamics</li>
        <li><strong>For off-road:</strong> True 4WD with low-range is essential</li>
      </ul>
    </InsightLayout>
  );
}
