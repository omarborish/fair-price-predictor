'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { InsightLayout } from '@/components/InsightLayout';
import { ManufacturerChart } from '@/components/charts/ManufacturerChart';
import { getInsights } from '@/lib/api';
import { formatPrice, formatNumber } from '@/lib/utils';

export default function PriceDistributionPage() {
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

  const manufacturers = insights?.price_by_manufacturer || [];
  const typeData = insights?.price_by_type || [];
  const overallStats = insights?.overall_stats || {};

  return (
    <InsightLayout
      title="Used Car Price Distribution: What Cars Actually Cost"
      description="Explore the real-world pricing landscape of the used car market. See median prices by make, type, and market segment."
      icon={<BarChart3 className="w-6 h-6" />}
    >
      <h2>The Used Car Market at a Glance</h2>
      
      <p>
        The used car market is vast and varied, with prices ranging from under $5,000 to over $100,000. 
        Our analysis of {formatNumber(overallStats.total_listings || 300000)} listings shows the median 
        used car price is <strong>{formatPrice(overallStats.median_price || 16000)}</strong>, but this 
        varies dramatically by make, model, and vehicle type.
      </p>

      <div className="not-prose my-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(overallStats.median_price || 16000)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Median Price</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{overallStats.median_year || 2014}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Median Year</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatNumber(overallStats.median_odometer || 88000)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Median Miles</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{overallStats.unique_manufacturers || 40}+</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Makes</p>
        </div>
      </div>

      <h2>Price by Manufacturer</h2>
      
      <p>
        Different manufacturers command vastly different prices in the used market. This reflects 
        brand positioning, reliability reputation, and target demographics.
      </p>

      <div className="not-prose my-8 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Median Price by Manufacturer
        </h3>
        {manufacturers.length > 0 && <ManufacturerChart data={manufacturers.slice(0, 15)} />}
      </div>

      <h3>Premium vs. Value Brands</h3>
      <p>
        The data reveals clear market segmentation:
      </p>
      <ul>
        <li><strong>Premium Trucks (RAM, GMC):</strong> Median prices over $25,000</li>
        <li><strong>Luxury (Audi, Lexus, Acura):</strong> $20,000-$25,000 range</li>
        <li><strong>Mainstream (Toyota, Ford, Chevrolet):</strong> $14,000-$18,000</li>
        <li><strong>Economy (Honda, Hyundai, Kia):</strong> $10,000-$13,000</li>
      </ul>

      <h2>Price by Vehicle Type</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-sm text-slate-700 dark:text-slate-300">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 px-3 font-semibold">Type</th>
              <th className="text-left py-2 px-3 font-semibold">Median Price</th>
              <th className="text-left py-2 px-3 font-semibold">Listings</th>
            </tr>
          </thead>
          <tbody>
            {typeData.sort((a: any, b: any) => b.median - a.median).map((row: any) => (
              <tr key={row.type} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3 capitalize">{row.type}</td>
                <td className="py-2 px-3">{formatPrice(row.median)}</td>
                <td className="py-2 px-3">{row.count?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Key Observations</h3>
      <ul>
        <li><strong>Trucks and Pickups</strong> command the highest median prices, reflecting strong demand</li>
        <li><strong>Coupes</strong> maintain premium pricing due to their sport-oriented appeal</li>
        <li><strong>Sedans</strong> represent the largest category but have moderate pricing</li>
        <li><strong>Mini-vans</strong> are the most affordable segment, ideal for budget-conscious families</li>
      </ul>

      <h2>What This Means for You</h2>

      <h3>For Buyers</h3>
      <p>
        Understanding price distribution helps set realistic expectations. If you're budget-conscious, 
        consider Japanese sedans (Honda, Toyota) which offer reliability at lower price points. If 
        you need a truck, expect to pay premium prices regardless of brand.
      </p>

      <h3>For Sellers</h3>
      <p>
        Your vehicle's value is heavily influenced by its segment. A well-maintained truck will likely 
        sell faster and for more money than a comparable sedan. Use our price predictor to get a 
        personalized estimate based on your specific vehicle.
      </p>
    </InsightLayout>
  );
}
