'use client';

import { useState } from 'react';
import { Car, TrendingUp, Shield, Zap, AlertCircle } from 'lucide-react';
import { PredictorForm } from '@/components/PredictorForm';
import { PredictionResult } from '@/components/PredictionResult';
import { AdSlot } from '@/components/AdSlot';
import { CarDetails, PredictionResponse, predictPrice } from '@/lib/api';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (details: CarDetails) => {
    setIsLoading(true);
    setError(null);
    setCarDetails(details);

    try {
      const prediction = await predictPrice(details);
      setResult(prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction. Please try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Price Estimates
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Get the <span className="gradient-text">Fair Price</span> for Any Used Car
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Our AI analyzes millions of car listings to give you accurate market value estimates, 
              confidence intervals, and insights to help you buy or sell with confidence.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span>Data-Driven Estimates</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span>No Data Stored</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-purple-400" />
                <span>All Makes & Models</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-slate-50 dark:fill-slate-900"
            />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-10">
        {/* Top Ad */}
        <div className="mb-8">
          <AdSlot position="header" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Enter Your Car Details
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Get an instant fair market price estimate
                  </p>
                </div>
              </div>

              <PredictorForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>

            {/* Error State */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-200">
                      Prediction Error
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {result && carDetails && (
              <div className="mt-8">
                <PredictionResult result={result} carDetails={carDetails} />
              </div>
            )}

            {/* In-Content Ad */}
            {result && (
              <div className="mt-8">
                <AdSlot position="in-content" />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sidebar Ad */}
            <AdSlot position="sidebar" />

            {/* How It Works Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Enter Details</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Provide your car's year, make, model, and mileage
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">AI Analysis</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Our model compares against millions of listings
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Get Results</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Receive price estimate with confidence interval
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                Important Note
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Price estimates are based on historical market data and should be used as 
                a reference only. Actual prices may vary based on location, condition details, 
                and market conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Why Use Fair Price Predictor?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Make smarter car buying and selling decisions with data-driven insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Data-Driven Accuracy
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Our AI model is trained on millions of real car listings to provide 
                accurate market valuations.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Confidence Intervals
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get not just a single price, but a realistic range so you know 
                what to expect in negotiations.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Market Comparisons
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                See how your car stacks up against similar vehicles 
                currently on the market.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
