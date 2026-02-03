'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Brain, Database, BarChart3, Target, AlertTriangle, 
  CheckCircle2, XCircle, ArrowRight, Info, Lightbulb,
  TrendingUp, Percent, DollarSign, Scale
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface Metrics {
  mae: number;
  rmse: number;
  mape: number;
  within_5pct: number;
  within_10pct: number;
  within_15pct: number;
  within_20pct: number;
  within_25pct: number;
  interval_coverage: number;
  median_interval_width: number;
  feature_importance: Record<string, number>;
  model_type: string;
  training_samples: number;
  test_samples: number;
  computed_at: string;
}

// Feature name mapping for human-readable display
const featureNameMap: Record<string, string> = {
  'odometer': 'Mileage',
  'car_age_squared': 'Car Age (Squared)',
  'car_age': 'Car Age',
  'year': 'Model Year',
  'log_odometer': 'Log Mileage',
  'cylinders_6 cylinders': '6 Cylinders',
  'cylinders_3 cylinders': '3 Cylinders',
  'cylinders_other': 'Other Cylinders',
  'transmission_manual': 'Manual Trans.',
  'transmission_automatic': 'Auto Trans.',
  'transmission_unknown': 'Trans. Unknown',
  'condition_unknown': 'Condition Unknown',
  'type_hatchback': 'Hatchback',
  'type_mini-van': 'Mini-Van',
  'model_encoded': 'Model',
};

export default function ModelPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/data/metrics.json')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const featureData = metrics?.feature_importance 
    ? Object.entries(metrics.feature_importance)
        .map(([name, importance]) => ({
          name: featureNameMap[name] || name,
          importance: Number(importance.toFixed(1)),
        }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 10)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Model & Accuracy
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                How predictions are made and how accurate they are
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Overview */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              I trained a machine learning model on a large dataset of used car listings to predict fair market prices. 
              When you enter a car's details, the model analyzes patterns from similar vehicles to estimate what 
              that car should reasonably sell for.
            </p>
            <p>
              The model uses <strong>gradient boosting</strong>—a technique that combines many decision trees to 
              make predictions. It's effective for this type of problem because it can capture non-linear 
              relationships (like how depreciation accelerates after certain mileage thresholds).
            </p>
          </div>
        </section>

        {/* The Data */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              The Data
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Training Samples</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {metrics?.training_samples?.toLocaleString() || '~275,000'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Test Samples</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {metrics?.test_samples?.toLocaleString() || '~69,000'}
              </p>
            </div>
          </div>

          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Features Used</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {['Year', 'Make', 'Model', 'Mileage', 'Condition', 'Cylinders', 'Fuel Type', 'Transmission', 'Drive Type', 'Vehicle Type', 'State'].map(f => (
              <span key={f} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                {f}
              </span>
            ))}
          </div>

          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">What's Missing (Limitations)</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">
                <strong>Vehicle history</strong> — accidents, service records, ownership count
              </span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">
                <strong>Specific trim levels</strong> — base vs fully loaded options
              </span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">
                <strong>Color and interior</strong> — can affect resale value
              </span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">
                <strong>Real-time market conditions</strong> — data has a snapshot date
              </span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Honest note:</strong> I wanted to include more features like trim levels and vehicle history, 
              but couldn't find a publicly available dataset with that information. The current dataset is good 
              but not perfect—which is why I show price ranges rather than single numbers.
            </p>
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Performance Metrics
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : metrics ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-medium">MAE</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    ${Math.round(metrics.mae).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Avg. error</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <Percent className="w-4 h-4" />
                    <span className="text-xs font-medium">MAPE</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {metrics.mape.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">% error</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-medium">Within ±10%</span>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {metrics.within_10pct.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">of predictions</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <Scale className="w-4 h-4" />
                    <span className="text-xs font-medium">Coverage</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {metrics.interval_coverage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">in range</p>
                </div>
              </div>

              {/* Accuracy breakdown */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Prediction Accuracy Breakdown</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Within ±5%', value: metrics.within_5pct },
                    { label: 'Within ±10%', value: metrics.within_10pct },
                    { label: 'Within ±15%', value: metrics.within_15pct },
                    { label: 'Within ±20%', value: metrics.within_20pct },
                    { label: 'Within ±25%', value: metrics.within_25pct },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 dark:text-slate-400 w-24">{item.label}</span>
                      <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white w-12 text-right">
                        {item.value.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last evaluated: {new Date(metrics.computed_at).toLocaleDateString('en-US', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </p>
            </>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Metrics unavailable</p>
          )}
        </section>

        {/* Feature Importance */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              What Affects Price Most
            </h2>
          </div>

          {featureData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} width={75} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number) => [`${value}%`, 'Importance']}
                  />
                  <Bar dataKey="importance" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          )}
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
            Mileage and age are the strongest predictors, which aligns with how used car markets actually work. 
            Interestingly, certain vehicle types and configurations also have measurable impact.
          </p>
        </section>

        {/* Comparison to Other Tools */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              How This Compares to Established Pricing Tools
            </h2>
          </div>

          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              There are several well-known vehicle pricing tools with larger datasets, more features, and 
              proprietary data sources. I won't name them here, but you've probably used them.
            </p>
            <p>
              To fairly compare this tool against those, I would need to:
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Sample 30-50 vehicles</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Diverse makes, models, years, and conditions</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Input the same specs into each tool</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Record the estimated price or range from each</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Compare to actual sale prices</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">If available, see which tool was closest</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Status: Planned Evaluation</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  I haven't run this comparison yet. Without it, I can't claim this tool is better or worse than 
                  alternatives—only that it exists, it's free, and these are its measured metrics on the test set.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Help Improve */}
        <section className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6" />
            <h2 className="text-xl font-bold">Help Improve the Model</h2>
          </div>
          <p className="text-green-100 mb-6">
            If you end up selling your car, you can optionally share the actual sale price. This helps me 
            evaluate real-world accuracy and improve future predictions. All submissions are anonymous.
          </p>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors"
          >
            Submit Actual Sale Price
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

      </div>
    </div>
  );
}
