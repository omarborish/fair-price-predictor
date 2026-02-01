'use client';

import { useState, useEffect } from 'react';
import { TrendingDown, Loader2 } from 'lucide-react';
import { InsightLayout } from '@/components/InsightLayout';
import { DepreciationChart } from '@/components/charts/DepreciationChart';
import { getInsights } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function DepreciationPage() {
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

  const depreciationData = insights?.depreciation_curve || [];
  const priceByYear = insights?.price_by_year || [];

  // Calculate depreciation rates
  const yearlyDepreciation = priceByYear.slice(0, -1).map((curr: any, i: number) => {
    const next = priceByYear[i + 1];
    if (!next) return null;
    const rate = ((next.median - curr.median) / curr.median) * 100;
    return { year: next.year, rate: rate.toFixed(1) };
  }).filter(Boolean);

  return (
    <InsightLayout
      title="Car Depreciation by Year: The Complete Guide"
      description="Understand how vehicle age affects value. See real depreciation curves and learn when cars lose the most value."
      icon={<TrendingDown className="w-6 h-6" />}
    >
      <h2>Understanding Vehicle Depreciation</h2>
      
      <p>
        Depreciation is the single largest cost of car ownership, often exceeding fuel, insurance, and 
        maintenance combined. Our analysis of {insights?.overall_stats?.total_listings?.toLocaleString() || '300,000'}+ 
        vehicle listings reveals the true depreciation patterns in the used car market.
      </p>

      <div className="not-prose my-8 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Depreciation Curve by Vehicle Age
        </h3>
        {depreciationData.length > 0 && <DepreciationChart data={depreciationData} />}
      </div>

      <h2>The Depreciation Timeline</h2>

      <h3>Year 1-3: The Steepest Drop</h3>
      <p>
        New cars lose value fastest in their first three years. This is when depreciation hits hardest:
      </p>
      <ul>
        <li><strong>Year 1:</strong> Typically 20-30% value loss the moment you drive off the lot</li>
        <li><strong>Year 2:</strong> Another 15-20% drop as the car transitions from "new" to "used"</li>
        <li><strong>Year 3:</strong> 10-15% additional depreciation; many leases end here</li>
      </ul>

      <h3>Year 4-7: The Sweet Spot</h3>
      <p>
        Depreciation slows considerably during this period. Cars aged 4-7 years offer the best 
        value proposition for buyers:
      </p>
      <ul>
        <li>Major depreciation already absorbed by first owner</li>
        <li>Modern safety and tech features still relevant</li>
        <li>Reliable operation with proper maintenance</li>
        <li>Lower insurance costs than newer models</li>
      </ul>

      <h3>Year 8+: Stabilization</h3>
      <p>
        After 8 years, depreciation largely levels off. Value becomes more dependent on:
      </p>
      <ul>
        <li>Overall condition and maintenance history</li>
        <li>Mileage relative to age</li>
        <li>Brand reputation for longevity</li>
        <li>Whether it's a desirable or collectible model</li>
      </ul>

      <h2>Median Prices by Model Year</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-sm text-slate-700 dark:text-slate-300">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 px-3 font-semibold">Model Year</th>
              <th className="text-left py-2 px-3 font-semibold">Median Price</th>
              <th className="text-left py-2 px-3 font-semibold">Listings</th>
            </tr>
          </thead>
          <tbody>
            {priceByYear.slice(-10).reverse().map((row: any) => (
              <tr key={row.year} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3">{Math.round(row.year)}</td>
                <td className="py-2 px-3">{formatPrice(row.median)}</td>
                <td className="py-2 px-3">{row.count?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Brands That Hold Value Best</h2>
      <p>
        Not all vehicles depreciate equally. Brands known for reliability and durability—like Toyota, 
        Honda, and Lexus—typically retain value better than luxury brands or those with reliability 
        concerns. Trucks and SUVs also tend to hold value better than sedans.
      </p>

      <h2>Tips for Minimizing Depreciation Loss</h2>
      <ul>
        <li><strong>Buy used:</strong> Let someone else absorb the first-year drop</li>
        <li><strong>Choose wisely:</strong> Select vehicles known for holding value</li>
        <li><strong>Maintain well:</strong> Service records support higher resale</li>
        <li><strong>Time your sale:</strong> Sell before major mileage milestones</li>
        <li><strong>Keep it stock:</strong> Modifications rarely add resale value</li>
      </ul>
    </InsightLayout>
  );
}
