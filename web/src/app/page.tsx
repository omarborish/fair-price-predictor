'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Car, TrendingUp, Shield, AlertCircle, Database, 
  ArrowRight, BarChart3, Gauge, BookOpen, CheckCircle2
} from 'lucide-react';
import { PredictorForm } from '@/components/PredictorForm';
import { PredictionResult } from '@/components/PredictionResult';
import { AdSlot } from '@/components/AdSlot';
import { CarDetails, PredictionResponse, predictPrice } from '@/lib/api';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            Find the Fair Price for Any Used Car
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Get an instant, data-driven price estimate based on real market listings. 
            Know what a car is worth before you buy or sell.
          </p>

          {/* Trust Signal - Subtle and Credible */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-300">
            <Database className="w-4 h-4 text-blue-500" />
            Based on 300,000+ real vehicle listings
          </div>
        </div>
      </section>

      {/* Subtle Header Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdSlot position="header" />
      </div>

      {/* Price Predictor Form - Centered, Clean */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Enter Your Car Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We'll analyze current market data to estimate fair value
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

          {/* In-Content Ad After Results */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <AdSlot position="in-content" />
          </div>
        </div>
      )}

      {/* How We Calculate Section - Trust Building */}
      <section className="bg-white dark:bg-slate-800 border-t border-b border-slate-200 dark:border-slate-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              How We Calculate Fair Prices
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our estimates are based on real market data, not guesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Real Market Data
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We analyze hundreds of thousands of actual vehicle listings to understand 
                what cars are really selling for.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Key Value Factors
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Mileage, age, condition, make, model, and configuration all affect price. 
                Our model weighs each factor appropriately.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
              Our price estimates are based on historical market data and provide a strong starting point 
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

          {/* In-content ad before footer */}
          <AdSlot position="in-content" />
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
