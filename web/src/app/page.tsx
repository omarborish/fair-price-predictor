'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  TrendingUp, AlertCircle, Database,
  ArrowRight, BarChart3, Gauge, BookOpen, CheckCircle2,
  ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import { PredictorForm } from '@/components/PredictorForm';
import { PredictionResult } from '@/components/PredictionResult';
import { CarDetails, PredictionResponse, predictPrice, getModelInfo, ModelInfo } from '@/lib/api';

const LEGACY_MAE = 3269;
const LEGACY_WITHIN_10 = 39;
const LEGACY_WITHIN_15 = 52;

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [showEngineeringNotes, setShowEngineeringNotes] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getModelInfo()
      .then(setModelInfo)
      .catch(() => setModelInfo(null));
  }, []);

  const handleSubmit = async (details: CarDetails) => {
    setIsLoading(true);
    setError(null);
    setCarDetails(details);

    try {
      const prediction = await predictPrice(details);
      setResult(prediction);
      // Scroll to results after a brief delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction. Please try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section - Clean and Professional */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="flex justify-center mb-8">
            <Image src="/assets/hero.svg" alt="" width={400} height={240} className="w-full max-w-sm h-auto text-slate-400 dark:text-slate-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            Find the Fair Price for Any Used Car
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
            Get an instant, data-driven price estimate based on real market listings. 
            Know what a car is worth before you buy or sell.
          </p>

          {/* Free & Easy Emphasis */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-400 font-medium">
              Free. No login. No subscription.
            </span>
          </div>

          {/* Trust Signal - Subtle and Credible */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300">
              <Database className="w-4 h-4 text-blue-500" />
              Trained on 300,000+ real vehicle listings
            </div>
          </div>
        </div>
      </section>

      {/* Price Predictor Form - Centered, Clean */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Enter Your Car Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              I built this to stay simple: choose a car, get a price estimate.
            </p>
          </div>

          <PredictorForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Results Section */}
      {result && carDetails && (
        <div ref={resultsRef}>
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <PredictionResult result={result} carDetails={carDetails} />
          </section>
        </div>
      )}

      {/* How We Calculate Section - Trust Building */}
      <section className="bg-white dark:bg-slate-800 border-t border-b border-slate-200 dark:border-slate-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              How I Calculate Fair Prices
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              My estimates are based on real market data, not guesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <Image src="/assets/icon-market.svg" alt="" width={24} height={24} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Real Market Data
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                I analyzed hundreds of thousands of actual vehicle listings to understand 
                what cars are really selling for.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                <Image src="/assets/icon-factors.svg" alt="" width={24} height={24} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Key Value Factors
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Mileage, age, condition, make, model, and configuration all affect price. 
                My model weighs each factor appropriately.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                <Image src="/assets/icon-price.svg" alt="" width={24} height={24} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Price Range Estimate
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Instead of a single number, you get a realistic range—low, fair, and high—so 
                you can negotiate confidently.
              </p>
            </div>
          </div>

          {/* Model Update / Accuracy panel - fetches /model_info */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              Model Update &amp; Accuracy
            </h3>
            <ul className="text-slate-600 dark:text-slate-400 text-sm mb-4 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                FastAI Tabular for embeddings and nonlinear interactions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                CatBoost for strong categorical handling
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                Blended in log-space for stability (0.6 FastAI + 0.4 CatBoost)
              </li>
            </ul>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p className="text-slate-500 dark:text-slate-400">MAE</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {modelInfo?.metrics?.mae != null ? `$${Math.round(modelInfo.metrics.mae).toLocaleString()}` : '~$2,582'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">RMSE</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {modelInfo?.metrics?.rmse != null ? `$${Math.round(modelInfo.metrics.rmse).toLocaleString()}` : '~$5,527'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Within ±10%</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {modelInfo?.metrics?.within_10pct != null ? `${modelInfo.metrics.within_10pct.toFixed(1)}%` : '52.0%'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Within ±15%</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {modelInfo?.metrics?.within_15pct != null ? `${modelInfo.metrics.within_15pct.toFixed(1)}%` : '65.8%'}
                </p>
              </div>
              {modelInfo?.metrics?.r2 != null && (
                <div>
                  <p className="text-slate-500 dark:text-slate-400">R²</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{modelInfo.metrics.r2.toFixed(3)}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              <strong>Before vs After:</strong> Legacy MAE ~${LEGACY_MAE.toLocaleString()} → New MAE ~${modelInfo?.metrics?.mae != null ? Math.round(modelInfo.metrics.mae).toLocaleString() : '2,582'}. Legacy within ±10% ~{LEGACY_WITHIN_10}% → New ~{modelInfo?.metrics?.within_10pct != null ? modelInfo.metrics.within_10pct.toFixed(0) : '52'}%.
            </p>
            <button
              type="button"
              onClick={() => setShowEngineeringNotes(!showEngineeringNotes)}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showEngineeringNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Engineering notes
            </button>
            {showEngineeringNotes && (
              <ul className="mt-3 text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Train/serve mismatch was fixed (evaluation now uses split_indices + exact preprocessing parity).</li>
                <li>Best model saved by valid_loss (SaveModelCallback).</li>
                <li>No overfitting: validation ≈ test.</li>
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Why Estimates Vary - Transparency Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Why Estimates Can Vary
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              My price estimates are based on historical market data and provide a strong starting point 
              for understanding a vehicle's value. However, final sale prices can differ due to:
            </p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Local market conditions</strong> — prices vary by region and timing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Vehicle history</strong> — accidents, service records, ownership count</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Specific condition details</strong> — wear, upgrades, cosmetic issues</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Seller motivation</strong> — private sales vs dealer pricing</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Understanding Used Car Prices - Substantial Content Section */}
      <section className="py-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Understanding Used Car Prices
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A price estimate is a starting point, not a final answer. Here is what you should know to use it effectively.
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                What This Tool Does
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Fair Price Predictor analyzes your vehicle&apos;s make, model, year, mileage, condition,
                and other attributes against a dataset of over 300,000 real vehicle listings. The
                result is a data-driven estimate of fair market value — not a guarantee of what
                any specific buyer or seller will agree to, but a well-informed benchmark based
                on what similar cars have actually been listed for.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The prediction includes a price range (low, fair, and high) because no two used
                cars are identical. Even two cars of the same make, model, year, and mileage
                can differ in condition, service history, and local market demand.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Key Factors That Influence Price
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Used car prices are shaped by a combination of vehicle-specific and market-level
                factors. The biggest drivers are age and mileage — a newer car with fewer miles
                is almost always worth more. But condition, accident history, title status, fuel
                type, drivetrain, and even color play meaningful roles.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Regional demand matters too. Trucks and AWD vehicles command higher prices in
                areas with harsh winters, while fuel-efficient sedans hold value better in urban
                markets. Read our{' '}
                <Link href="/what-affects-used-car-value" className="text-green-600 dark:text-green-400 hover:underline">
                  guide on what affects used car value
                </Link>{' '}
                for a detailed breakdown of every major pricing factor.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Limitations and What to Do Next
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                No automated tool can account for everything. Our model does not know about
                unreported accidents, deferred maintenance, aftermarket modifications, or the
                seller&apos;s urgency. It cannot inspect the car, check the tires, or smell
                for water damage. These are things only an in-person evaluation can reveal.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Use this estimate as your starting point, then compare it against local listings
                on sites like AutoTrader, Cars.com, and Facebook Marketplace. If you are buying,
                always get a pre-purchase inspection from an independent mechanic. If you are
                selling, a clean service history and honest condition description will help you
                get closer to the top of the price range. See our{' '}
                <Link href="/buying-a-used-car-guide" className="text-green-600 dark:text-green-400 hover:underline">
                  buying guide
                </Link>{' '}
                for a complete walkthrough.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/guides" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <FileText className="w-4 h-4" />
              Browse All Guides
            </Link>
            <Link href="/how-used-car-pricing-works" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              How Pricing Works
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Insights Section - Monetization Engine */}
      <section className="py-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Understand the Used Car Market
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Learn what affects car values with our data-driven insights
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link
              href="/insights/mileage-impact"
              className="group flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  How Mileage Affects Price
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  The 100k-mile myth and what really matters
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 ml-auto mt-1 transition-colors" />
            </Link>

            <Link
              href="/insights/depreciation-by-year"
              className="group flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Depreciation by Year
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  When cars lose the most value
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 ml-auto mt-1 transition-colors" />
            </Link>

            <Link
              href="/insights/price-distribution"
              className="group flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Price Distribution
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  What cars actually cost by make and type
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 ml-auto mt-1 transition-colors" />
            </Link>

            <Link
              href="/insights"
              className="group flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  View All Insights
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Explore more market analysis
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 ml-auto mt-1 transition-colors" />
            </Link>
          </div>

        </div>
      </section>

      {/* Final Trust Statement */}
      <section className="py-10 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fair Price Predictor provides estimates based on historical market data. 
            These estimates are for informational purposes only and should not replace 
            professional appraisals or inspections. Always verify vehicle condition 
            and history before making purchase decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
