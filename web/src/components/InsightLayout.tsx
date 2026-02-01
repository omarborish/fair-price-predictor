'use client';

import Link from 'next/link';
import { ArrowLeft, TrendingUp, BarChart3, Gauge, Fuel, Settings } from 'lucide-react';
import { AdSlot } from './AdSlot';

interface InsightLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const relatedInsights = [
  { href: '/insights/mileage-impact', label: 'Mileage Impact', icon: <Gauge className="w-4 h-4" /> },
  { href: '/insights/depreciation-by-year', label: 'Depreciation by Year', icon: <TrendingUp className="w-4 h-4" /> },
  { href: '/insights/price-distribution', label: 'Price Distribution', icon: <BarChart3 className="w-4 h-4" /> },
  { href: '/insights/drivetrain-premium', label: 'Drivetrain Premium', icon: <Settings className="w-4 h-4" /> },
  { href: '/insights/fuel-type-comparison', label: 'Fuel Type Comparison', icon: <Fuel className="w-4 h-4" /> },
];

export function InsightLayout({ title, description, children, icon }: InsightLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/insights" 
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Insights
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            {icon && <div className="p-2 bg-white/20 rounded-xl">{icon}</div>}
            <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
          </div>
          <p className="text-lg text-blue-100 max-w-2xl">{description}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AdSlot position="header" className="mb-8" />

        {/* Main Content */}
        <article className="prose prose-slate dark:prose-invert max-w-none">
          {children}
        </article>

        {/* CTA */}
        <div className="mt-12 p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl text-white text-center">
          <h3 className="text-xl font-bold mb-2">Try It For Your Car</h3>
          <p className="text-green-100 mb-4">
            Get an instant, AI-powered price estimate for your specific vehicle.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors"
          >
            Get Your Estimate
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        <AdSlot position="in-content" className="my-8" />

        {/* Related Insights */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Explore More Insights
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {relatedInsights.map((insight) => (
              <Link
                key={insight.href}
                href={insight.href}
                className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {insight.icon}
                {insight.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
