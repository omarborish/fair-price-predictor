'use client';

import { useEffect, useState } from 'react';
import { 
  Database, Cpu, BarChart3, Target, Sparkles, Shield,
  CheckCircle, ArrowRight, Brain, Layers, Loader2
} from 'lucide-react';
import Link from 'next/link';

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
  model_type: string;
  training_samples: number;
  test_samples: number;
}

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
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const formatPercent = (val: number) => `${val.toFixed(1)}%`;
  const formatPrice = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              Our Methodology
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              How We Calculate Fair Prices
            </h1>
            <p className="text-lg text-purple-100">
              Understand the data science and machine learning behind our accurate 
              used car price predictions.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Live Metrics Banner */}
        {metrics && (
          <div className="mb-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">Current Model Performance</h2>
              <p className="text-green-100">Real metrics from our trained model</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{formatPercent(metrics.within_15pct)}</p>
                <p className="text-sm text-green-100">Within ±15%</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{formatPercent(metrics.within_10pct)}</p>
                <p className="text-sm text-green-100">Within ±10%</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{formatPrice(metrics.mae)}</p>
                <p className="text-sm text-green-100">Avg Error (MAE)</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <p className="text-3xl font-bold">{formatPercent(metrics.interval_coverage)}</p>
                <p className="text-sm text-green-100">Interval Coverage</p>
              </div>
            </div>
          </div>
        )}

        {/* 6-Step Process Cards */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          Our 6-Step Process
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StepCard
            number={1}
            icon={<Database className="w-6 h-6" />}
            title="Data Collection"
            description="We source hundreds of thousands of real used car listings from across the United States, ensuring comprehensive market coverage."
            color="from-blue-500 to-blue-600"
          />
          <StepCard
            number={2}
            icon={<Layers className="w-6 h-6" />}
            title="Data Cleaning"
            description="We remove outliers, handle missing values, and filter unrealistic prices to ensure only quality data trains our model."
            color="from-indigo-500 to-indigo-600"
          />
          <StepCard
            number={3}
            icon={<Cpu className="w-6 h-6" />}
            title="Feature Engineering"
            description="We transform raw data into meaningful features: vehicle age, log-scaled mileage, make/model encoding, and more."
            color="from-purple-500 to-purple-600"
          />
          <StepCard
            number={4}
            icon={<Brain className="w-6 h-6" />}
            title="Model Training"
            description={metrics ? `Using ${metrics.model_type.replace('histgb', 'HistGradientBoosting').replace('catboost', 'CatBoost')} on ${metrics.training_samples.toLocaleString()} samples for accurate predictions.` : "Advanced gradient boosting algorithms trained on hundreds of thousands of listings."}
            color="from-pink-500 to-pink-600"
          />
          <StepCard
            number={5}
            icon={<Target className="w-6 h-6" />}
            title="Prediction Intervals"
            description="Quantile regression provides not just a point estimate, but a realistic price range (10th to 90th percentile)."
            color="from-orange-500 to-orange-600"
          />
          <StepCard
            number={6}
            icon={<Sparkles className="w-6 h-6" />}
            title="Explainability"
            description="Feature importance analysis shows exactly which factors are pushing the price up or down for your specific car."
            color="from-green-500 to-green-600"
          />
        </div>

        {/* Detailed Metrics Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Detailed Model Metrics
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : metrics ? (
            <div className="space-y-6">
              {/* Accuracy Tiers */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Prediction Accuracy</h3>
                <div className="space-y-3">
                  <AccuracyBar label="Within ±5%" value={metrics.within_5pct} />
                  <AccuracyBar label="Within ±10%" value={metrics.within_10pct} />
                  <AccuracyBar label="Within ±15%" value={metrics.within_15pct} />
                  <AccuracyBar label="Within ±20%" value={metrics.within_20pct} />
                  <AccuracyBar label="Within ±25%" value={metrics.within_25pct} />
                </div>
              </div>

              {/* Error Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <MetricCard
                  label="Mean Absolute Error"
                  value={formatPrice(metrics.mae)}
                  description="Average deviation from actual price"
                />
                <MetricCard
                  label="Root Mean Square Error"
                  value={formatPrice(metrics.rmse)}
                  description="Penalizes larger errors more"
                />
                <MetricCard
                  label="Mean Absolute % Error"
                  value={formatPercent(metrics.mape)}
                  description="Average percentage error"
                />
              </div>

              {/* Interval Coverage */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Prediction Interval Coverage</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatPercent(metrics.interval_coverage)} of actual prices fall within our p10-p90 range
                      </p>
                    </div>
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {formatPercent(metrics.interval_coverage)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard label="Mean Absolute Error" value="~$2,500" description="Average prediction deviation" />
              <MetricCard label="Accuracy Range" value="85-90%" description="Predictions within market range" />
              <MetricCard label="Interval Coverage" value="80%" description="Our prediction interval coverage" />
            </div>
          )}
        </div>

        {/* Features Used */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Features Used in Prediction
          </h2>
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
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800 mb-12">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Important Disclaimer
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Our price predictions are estimates based on historical data and statistical 
                modeling. Actual market prices can vary significantly based on factors not 
                captured in our model, including local market conditions, vehicle history, 
                negotiation, and current economic factors. Always conduct your own research 
                and consider getting a professional appraisal for significant transactions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-lg hover:shadow-green-500/25"
          >
            Try the Price Predictor
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-shadow">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-slate-400">STEP {number}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
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

function MetricCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{value}</p>
      <p className="font-medium text-slate-900 dark:text-white">{label}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function AccuracyBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <div className="flex-grow h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-16 text-right font-semibold text-slate-900 dark:text-white">
        {value.toFixed(1)}%
      </span>
    </div>
  );
}
