'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, TrendingDown, Gauge, Settings, Fuel, Truck, 
  CarFront, Loader2, AlertCircle, LightbulbIcon, ArrowRight 
} from 'lucide-react';
import { DepreciationChart } from '@/components/charts/DepreciationChart';
import { MileageImpactChart } from '@/components/charts/MileageImpactChart';
import { ManufacturerChart } from '@/components/charts/ManufacturerChart';
import { getInsights } from '@/lib/api';
import { formatPrice, formatNumber } from '@/lib/utils';

const insightPages = [
  {
    href: '/insights/mileage-impact',
    title: 'Mileage Impact on Price',
    description: 'How odometer readings affect vehicle value',
    icon: <Gauge className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600'
  },
  {
    href: '/insights/depreciation-by-year',
    title: 'Depreciation by Year',
    description: 'Understanding the depreciation curve',
    icon: <TrendingDown className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600'
  },
  {
    href: '/insights/price-distribution',
    title: 'Price Distribution',
    description: 'What cars actually cost by make and type',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'from-green-500 to-green-600'
  },
  {
    href: '/insights/drivetrain-premium',
    title: 'Drivetrain Premium',
    description: 'AWD, 4WD, FWD, and RWD price differences',
    icon: <Settings className="w-6 h-6" />,
    color: 'from-amber-500 to-amber-600'
  },
  {
    href: '/insights/fuel-type-comparison',
    title: 'Fuel Type Comparison',
    description: 'Gas vs. diesel vs. hybrid vs. electric',
    icon: <Fuel className="w-6 h-6" />,
    color: 'from-cyan-500 to-cyan-600'
  },
];

export default function InsightsPage() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInsights()
      .then(setInsights)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading market insights...</p>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Insights Not Available
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Market insights will be available after the model is trained. 
            Please run the training script first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4" />
              Auto-Generated Insights
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Used Car Market Insights
            </h1>
            <p className="text-lg text-blue-100">
              Discover trends, patterns, and data-driven insights from our analysis 
              of {formatNumber(insights.overall_stats?.total_listings || 0)} vehicle listings.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard
            label="Total Listings"
            value={formatNumber(insights.overall_stats?.total_listings || 0)}
            icon={<CarFront className="w-5 h-5" />}
          />
          <StatCard
            label="Median Price"
            value={formatPrice(insights.overall_stats?.median_price || 0)}
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <StatCard
            label="Median Year"
            value={String(insights.overall_stats?.median_year || 'N/A')}
            icon={<TrendingDown className="w-5 h-5" />}
          />
          <StatCard
            label="Manufacturers"
            value={formatNumber(insights.overall_stats?.unique_manufacturers || 0)}
            icon={<Truck className="w-5 h-5" />}
          />
        </div>

        {/* Explore Insights */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <LightbulbIcon className="w-6 h-6 text-amber-500" />
            Explore In-Depth Analysis
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {insightPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover:shadow-lg transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${page.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${page.color} text-white mb-4`}>
                  {page.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {page.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {page.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                  Read More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Insight Summaries */}
        {insights.summaries && insights.summaries.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <LightbulbIcon className="w-6 h-6 text-amber-500" />
              Key Takeaways
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.summaries.map((summary: any, index: number) => (
                <InsightCard key={index} summary={summary} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Depreciation Chart */}
            {insights.depreciation_curve && (
              <ChartCard
                title="Depreciation Curve"
                description="How car values change with age"
                icon={<TrendingDown className="w-5 h-5 text-red-500" />}
              >
                <DepreciationChart data={insights.depreciation_curve} />
              </ChartCard>
            )}

            {/* Mileage Impact */}
            {insights.price_by_mileage && (
              <ChartCard
                title="Mileage Impact on Price"
                description="How mileage affects vehicle value"
                icon={<Gauge className="w-5 h-5 text-blue-500" />}
              >
                <MileageImpactChart data={insights.price_by_mileage} />
              </ChartCard>
            )}

            {/* Manufacturer Prices */}
            {insights.price_by_manufacturer && (
              <ChartCard
                title="Price by Manufacturer"
                description="Median prices across top manufacturers"
                icon={<Truck className="w-5 h-5 text-purple-500" />}
              >
                <ManufacturerChart data={insights.price_by_manufacturer} />
              </ChartCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Transmission Impact */}
            {insights.price_by_transmission && (
              <DataCard
                title="Transmission Type"
                icon={<Settings className="w-5 h-5 text-slate-500" />}
                data={insights.price_by_transmission}
                labelKey="transmission"
              />
            )}

            {/* Fuel Type Impact */}
            {insights.price_by_fuel && (
              <DataCard
                title="Fuel Type"
                icon={<Fuel className="w-5 h-5 text-orange-500" />}
                data={insights.price_by_fuel}
                labelKey="fuel"
              />
            )}

            {/* Drive Type */}
            {insights.price_by_drive && (
              <DataCard
                title="Drive Type"
                icon={<CarFront className="w-5 h-5 text-green-500" />}
                data={insights.price_by_drive}
                labelKey="drive"
              />
            )}

            {/* Vehicle Type */}
            {insights.price_by_type && (
              <DataCard
                title="Vehicle Type"
                icon={<Truck className="w-5 h-5 text-indigo-500" />}
                data={insights.price_by_type}
                labelKey="type"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function ChartCard({ 
  title, 
  description, 
  icon, 
  children 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function DataCard({ 
  title, 
  icon, 
  data,
  labelKey 
}: { 
  title: string; 
  icon: React.ReactNode;
  data: Array<{ median: number; count: number; [key: string]: any }>;
  labelKey: string;
}) {
  const sortedData = [...data]
    .filter(d => d.count >= 100)
    .sort((a, b) => b.median - a.median)
    .slice(0, 6);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-3">
        {sortedData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
              {String(item[labelKey]).toUpperCase()}
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {formatPrice(item.median)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard({ summary }: { summary: { title: string; text: string; icon: string } }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{summary.title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{summary.text}</p>
    </div>
  );
}
