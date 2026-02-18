'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Database, Cpu, BarChart3, Target, Sparkles, Shield, Brain, Layers,
  ArrowRight, Loader2, XCircle, Lightbulb,
  DollarSign, Percent, Scale
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
  median_interval_width?: number;
  feature_importance?: Record<string, number>;
  model_type: string;
  training_samples: number;
  test_samples: number;
  computed_at?: string;
}

const featureNameMap: Record<string, string> = {
  odometer: 'Mileage',
  car_age_squared: 'Car Age (Squared)',
  car_age: 'Car Age',
  year: 'Model Year',
  log_odometer: 'Log Mileage',
  manufacturer_model: 'Make×Model',
  condition: 'Condition',
  region: 'Region',
  transmission: 'Transmission',
  fuel: 'Fuel',
  drive: 'Drive',
  type: 'Type',
  paint_color: 'Color',
};

export default function MethodologyPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/metrics.json')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const featureData = metrics?.feature_importance
    ? Object.entries(metrics.feature_importance)
        .map(([name, importance]) => ({
          name: featureNameMap[name] || name,
          importance: Number(Number(importance).toFixed(1)),
        }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 10)
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              How It Works · Model & Accuracy
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              How I Calculate Fair Prices
            </h1>
            <p className="text-lg text-purple-100">
              Methodology, model details, and accuracy metrics in one place.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Current model banner */}
        <section className="bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
          <h2 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">
            Current model: FastAI Tabular
          </h2>
          <p className="text-green-700 dark:text-green-400 text-sm mb-4">
            Predictions use a <strong>FastAI Tabular</strong> model (when available) with shared feature engineering between training and inference. Region, make×model and region×make features improve accuracy; high-cardinality categories use learned embeddings.
          </p>
          <p className="text-green-600 dark:text-green-500 text-xs">
            A legacy gradient-boosting blend is used as fallback when FastAI weights are not deployed. Metrics below reflect the FastAI model.
          </p>
        </section>

        {/* Performance metrics */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Performance Metrics
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
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
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4">
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
              {metrics.computed_at && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Last evaluated: {new Date(metrics.computed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Metrics unavailable</p>
          )}
        </section>

        {/* How it works + 6-step process */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            I trained a machine learning model on a large dataset of used car listings to predict fair market prices. When you enter a car's details, the model analyzes patterns from similar vehicles to estimate what that car should reasonably sell for. The primary model is <strong>FastAI Tabular</strong>; a legacy gradient-boosting blend is used as fallback when FastAI weights are not available.
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            My 6-Step Process
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StepCard number={1} icon={<Database className="w-6 h-6" />} title="Data Collection" description="Hundreds of thousands of real used car listings from across the United States." color="from-blue-500 to-blue-600" />
            <StepCard number={2} icon={<Layers className="w-6 h-6" />} title="Data Cleaning" description="Outliers removed, missing values handled, unrealistic prices filtered." color="from-indigo-500 to-indigo-600" />
            <StepCard number={3} icon={<Cpu className="w-6 h-6" />} title="Feature Engineering" description="Vehicle age, log-scaled mileage, make/model encoding, region and interactions." color="from-purple-500 to-purple-600" />
            <StepCard number={4} icon={<Brain className="w-6 h-6" />} title="Model Training" description={metrics ? `FastAI Tabular on ${metrics.training_samples?.toLocaleString() ?? '~245k'} samples.` : 'Neural tabular model with embeddings.'} color="from-pink-500 to-pink-600" />
            <StepCard number={5} icon={<Target className="w-6 h-6" />} title="Prediction Intervals" description="Point estimate plus realistic price range (e.g. 10th–90th percentile)." color="from-orange-500 to-orange-600" />
            <StepCard number={6} icon={<Sparkles className="w-6 h-6" />} title="Explainability" description="Feature importance shows which factors push price up or down." color="from-green-500 to-green-600" />
          </div>
        </section>

        {/* The Data */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">The Data</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Training Samples</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {metrics?.training_samples?.toLocaleString() || '~245,000'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Test / Validation</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {metrics?.test_samples?.toLocaleString() || '~96,000'}
              </p>
            </div>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Features Used</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {['Year', 'Make', 'Model', 'Mileage', 'Condition', 'Cylinders', 'Fuel Type', 'Transmission', 'Drive Type', 'Vehicle Type', 'State', 'Region'].map(f => (
              <span key={f} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                {f}
              </span>
            ))}
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">What's Missing (Limitations)</h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span><strong>Vehicle history</strong> — accidents, service records, ownership count</span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span><strong>Specific trim levels</strong> — base vs fully loaded</span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span><strong>Color and interior</strong> — can affect resale value</span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span><strong>Real-time market conditions</strong> — data has a snapshot date</span>
            </div>
          </div>
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Honest note:</strong> I wanted to include trim levels and vehicle history but couldn't find a public dataset. I show price ranges rather than single numbers for that reason.
            </p>
          </div>
        </section>

        {/* Feature importance */}
        {featureData.length > 0 && (
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">What Affects Price Most</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} width={75} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(value: number) => [`${value}%`, 'Importance']} />
                  <Bar dataKey="importance" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
              Mileage and age are the strongest predictors; vehicle type and configuration also matter.
            </p>
          </section>
        )}

        {/* Features used (icon grid) */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Features Used in Prediction</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FeatureCard title="Year" description="Vehicle manufacture year" icon="📅" />
            <FeatureCard title="Mileage" description="Odometer reading" icon="🛣️" />
            <FeatureCard title="Make" description="Manufacturer brand" icon="🏭" />
            <FeatureCard title="Model" description="Specific vehicle model" icon="🚗" />
            <FeatureCard title="Condition" description="Vehicle condition rating" icon="✨" />
            <FeatureCard title="Transmission" description="Auto or Manual" icon="⚙️" />
            <FeatureCard title="Fuel Type" description="Gas, Diesel, Electric" icon="⛽" />
            <FeatureCard title="Drive Type" description="FWD, RWD, AWD" icon="🔄" />
          </div>
        </section>

        {/* Comparison to other tools */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">How This Compares to Other Pricing Tools</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            To fairly compare, I would need to sample 30–50 vehicles, input the same specs into each tool, and compare to actual sale prices. Status: planned. I can't claim this tool is better or worse—only that it's free and these are its measured metrics.
          </p>
          <Link href="/feedback" className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-medium hover:underline">
            Submit actual sale price to help improve
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Important Disclaimer</h3>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Price predictions are estimates based on historical data and statistical modeling. Actual market prices can vary. Always do your own research and consider a professional appraisal for significant transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Help Improve + CTA */}
        <section className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6" />
            <h2 className="text-xl font-bold">Help Improve the Model</h2>
          </div>
          <p className="text-green-100 mb-6">
            If you sell your car, you can optionally share the actual sale price. All submissions are anonymous.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/feedback" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors">
              Submit Actual Sale Price
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors">
              Try the Price Predictor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
  color,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-400">STEP {number}</span>
      <h3 className="font-bold text-slate-900 dark:text-white mt-1">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
      <span className="text-2xl mb-2 block">{icon}</span>
      <h5 className="font-semibold text-slate-900 dark:text-white">{title}</h5>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
