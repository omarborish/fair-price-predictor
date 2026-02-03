'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Scale, CheckCircle2, Circle, ArrowRight, AlertCircle,
  Car, DollarSign, Send, Loader2, Info, Target, BarChart3
} from 'lucide-react';

interface EvaluationEntry {
  id: string;
  created_at: string;
  year: number;
  make: string;
  model: string;
  mileage: number;
  our_prediction_low: number;
  our_prediction_mid: number;
  our_prediction_high: number;
  actual_sale_price: number | null;
  submitted_by: string;
}

// Evaluation checklist items
const evaluationChecklist = [
  {
    id: 'sample',
    title: 'Select Sample Vehicles',
    description: 'Choose 30-50 diverse vehicles across different makes, models, years, and price ranges.',
    status: 'complete',
    details: 'Focus on popular models with sufficient market data.'
  },
  {
    id: 'input',
    title: 'Input Specs to Multiple Tools',
    description: 'Enter the same specifications into this tool and at least 2-3 established pricing tools.',
    status: 'in_progress',
    details: 'Record the estimated price or range from each tool.'
  },
  {
    id: 'collect',
    title: 'Collect Actual Sale Prices',
    description: 'Track actual transaction prices when available.',
    status: 'pending',
    details: 'Users can optionally submit their actual sale prices to help with evaluation.'
  },
  {
    id: 'analyze',
    title: 'Analyze Accuracy',
    description: 'Compare which tool was closest to actual prices.',
    status: 'pending',
    details: 'Calculate MAE, hit rate within ranges, and bias direction.'
  },
  {
    id: 'publish',
    title: 'Publish Results',
    description: 'Share transparent findings on this page.',
    status: 'pending',
    details: 'Include methodology, sample size, and honest limitations.'
  },
];

export default function ComparePage() {
  const [submissions, setSubmissions] = useState<EvaluationEntry[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    mileage: '',
    actual_sale_price: '',
    our_prediction_mid: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Calculate stats from submissions
  const submissionsWithPrice = submissions.filter(s => s.actual_sale_price !== null);
  const totalSubmissions = submissionsWithPrice.length;
  
  let avgError = 0;
  let withinRange = 0;
  
  if (totalSubmissions > 0) {
    const errors = submissionsWithPrice.map(s => 
      Math.abs((s.actual_sale_price || 0) - s.our_prediction_mid)
    );
    avgError = errors.reduce((a, b) => a + b, 0) / totalSubmissions;
    
    withinRange = submissionsWithPrice.filter(s => 
      s.actual_sale_price !== null &&
      s.actual_sale_price >= s.our_prediction_low &&
      s.actual_sale_price <= s.our_prediction_high
    ).length;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission (in production, this would go to Supabase)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Comparative Evaluation
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                How accurate is this tool compared to others?
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Transparency Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Honest Assessment
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                I don't claim this tool is better than established pricing services—they have more data, 
                more features, and more resources. This page documents my evaluation methodology and 
                invites users to help measure real-world accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* Evaluation Progress */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Evaluation Methodology
          </h2>
          
          <div className="space-y-4">
            {evaluationChecklist.map((item, index) => (
              <div 
                key={item.id}
                className={`flex items-start gap-4 p-4 rounded-xl border ${
                  item.status === 'complete' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : item.status === 'in_progress'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : item.status === 'in_progress' ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Step {index + 1}
                    </span>
                    {item.status === 'in_progress' && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-white mt-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {item.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 italic">
                    {item.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Current Data Stats */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              User-Submitted Results
            </h2>
          </div>

          {totalSubmissions === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                No evaluation data yet
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Be the first to submit your actual sale price after using this tool!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {totalSubmissions}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Submissions</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${Math.round(avgError).toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Error</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {totalSubmissions > 0 ? Math.round((withinRange / totalSubmissions) * 100) : 0}%
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Within Range</p>
              </div>
            </div>
          )}
        </section>

        {/* Submit Actual Price */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Help Improve Accuracy
            </h2>
          </div>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Did you recently sell a car after using this tool? Submit the actual sale price 
            to help evaluate accuracy. All submissions are anonymous.
          </p>

          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Thank you!
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your submission helps improve the tool for everyone.
              </p>
            </div>
          ) : showSubmitForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="2019"
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mileage
                  </label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                    placeholder="50000"
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    placeholder="Toyota"
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="Camry"
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Our Estimate (from tool)
                  </label>
                  <input
                    type="number"
                    value={formData.our_prediction_mid}
                    onChange={(e) => setFormData({...formData, our_prediction_mid: e.target.value})}
                    placeholder="15000"
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Actual Sale Price
                  </label>
                  <input
                    type="number"
                    value={formData.actual_sale_price}
                    onChange={(e) => setFormData({...formData, actual_sale_price: e.target.value})}
                    placeholder="14500"
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Your Name (optional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Anonymous"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              Submit Actual Sale Price
            </button>
          )}
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-white">
          <h2 className="text-xl font-bold mb-4">Try the Price Predictor</h2>
          <p className="text-cyan-100 mb-6">
            Get a fair price estimate for your vehicle, then come back here to submit the actual sale price.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-cyan-600 font-medium rounded-lg hover:bg-cyan-50 transition-colors"
          >
            Get Price Estimate
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

      </div>
    </div>
  );
}
