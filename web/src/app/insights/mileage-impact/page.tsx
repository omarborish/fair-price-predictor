'use client';

import { useState, useEffect } from 'react';
import { Gauge, Loader2 } from 'lucide-react';
import { InsightLayout } from '@/components/InsightLayout';
import { MileageImpactChart } from '@/components/charts/MileageImpactChart';
import { getInsights } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function MileageImpactPage() {
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

  const mileageData = insights?.price_by_mileage || [];

  return (
    <InsightLayout
      title="How Mileage Affects Used Car Prices"
      description="Discover the relationship between odometer readings and vehicle value. Learn how much each mile impacts resale price."
      icon={<Gauge className="w-6 h-6" />}
    >
      <h2>The True Cost of Every Mile</h2>
      
      <p>
        Mileage is one of the most significant factors affecting used car values. Our analysis of over 
        {insights?.overall_stats?.total_listings?.toLocaleString() || '300,000'} vehicle listings reveals 
        clear patterns in how odometer readings impact pricing.
      </p>

      <div className="not-prose my-8 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Median Price by Mileage Band
        </h3>
        {mileageData.length > 0 && <MileageImpactChart data={mileageData} />}
      </div>

      <h2>Key Findings</h2>

      <h3>1. The 100,000-Mile Threshold</h3>
      <p>
        There's a significant psychological barrier at 100,000 miles. Vehicles with under 100k miles 
        command a substantial premium compared to those just over this threshold. Our data shows:
      </p>
      <ul>
        {mileageData.slice(0, 4).map((band: any, i: number) => (
          <li key={i}>
            <strong>{band.mileage_band}:</strong> Median price of {formatPrice(band.median)} 
            ({band.count?.toLocaleString()} listings)
          </li>
        ))}
      </ul>

      <h3>2. Depreciation Accelerates with Higher Mileage</h3>
      <p>
        The price drop per mile is not linear. Early miles (0-50k) have less impact than mid-range miles 
        (50k-100k). After 150,000 miles, prices stabilize as vehicles are valued more for functionality 
        than condition.
      </p>

      <h3>3. Low-Mileage Premium</h3>
      <p>
        Vehicles with under 25,000 miles sell at a significant premium, often 
        {mileageData[0] && mileageData[5] 
          ? ` ${Math.round((mileageData[0].median / mileageData[5].median - 1) * 100)}% more than` 
          : ' substantially more than'
        } high-mileage counterparts. This premium reflects:
      </p>
      <ul>
        <li>Lower expected maintenance costs</li>
        <li>Longer remaining useful life</li>
        <li>Better overall condition</li>
        <li>Original warranty coverage (in some cases)</li>
      </ul>

      <h2>Practical Advice for Buyers and Sellers</h2>

      <h3>For Buyers</h3>
      <p>
        Consider vehicles in the 50,000-75,000 mile range for the best value. These cars have proven 
        reliability while avoiding the steep premium of low-mileage vehicles. Focus on maintenance 
        history rather than odometer alone.
      </p>

      <h3>For Sellers</h3>
      <p>
        If you're approaching a major mileage milestone (50k, 75k, 100k), consider selling before 
        crossing it. The psychological impact of these thresholds can significantly affect your 
        vehicle's perceived value.
      </p>

      <h2>Methodology</h2>
      <p>
        This analysis uses real listing data from major automotive marketplaces. Prices are aggregated 
        by mileage bands and normalized to show median values, which better represent typical market 
        conditions than averages that can be skewed by outliers.
      </p>
    </InsightLayout>
  );
}
