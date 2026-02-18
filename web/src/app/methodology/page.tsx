'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Target, Shield, ArrowRight, Loader2, DollarSign, Percent, Scale,
  Lightbulb, BookOpen,
} from 'lucide-react';
import {
  getModelInfo,
  getTrainingMetrics,
  ModelInfo,
  TrainingMetrics,
} from '@/lib/api';

function formatMae(value: number | undefined): string {
  if (value == null) return '—';
  return `$${Math.round(value).toLocaleString()}`;
}

function formatPct(value: number | undefined): string {
  if (value == null) return '—';
  return `${value.toFixed(1)}%`;
}

function formatR2(value: number | undefined): string {
  if (value == null) return '—';
  return value.toFixed(3);
}

export default function MethodologyPage() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMetricsError(null);
    Promise.all([getModelInfo().catch(() => null), getTrainingMetrics().catch(() => null)])
      .then(([info, metrics]) => {
        if (cancelled) return;
        setModelInfo(info ?? null);
        setTrainingMetrics(metrics ?? null);
        if (!info && !metrics) setMetricsError('Metrics could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const blendTest = trainingMetrics?.blend_evaluation?.test;
  const legacy = trainingMetrics?.legacy_reference;
  const fastaiTest = trainingMetrics?.fastai_test;
  const hasComparison = legacy || fastaiTest || blendTest;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Methodology
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              How This System Works
            </h1>
            <p className="text-lg text-slate-300">
              From baseline to production: architecture, metrics, and the engineering decisions behind the Fair Price predictor.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* 1. Project Motivation */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Project Motivation
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Used car pricing is noisy. Listings depend on region, make and model, mileage, condition, and a long tail of factors that interact in non-obvious ways. Early versions of this predictor could ship end-to-end predictions, but they weren’t reliable enough to treat as a production tool. The goal shifted from “a model that runs” to building a <strong>robust, production-grade ML system</strong>—one where evaluation is reproducible, train and serve stay in parity, and the stack can be retrained and redeployed with confidence.
            </p>
          </div>
        </section>

        {/* 2. Iteration Journey */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Iteration Journey
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              The first step was a baseline pipeline that could take raw listing data and output a price. Metrics were acceptable on paper, but not strong enough for real use. During deeper evaluation, inconsistencies showed up: preprocessing at inference didn’t always match training, and evaluation scripts didn’t use a fixed split. Fixing train/serve parity and making evaluation reproducible (fixed train/validation/test split, same preprocessing path everywhere) became a prerequisite before adding more complexity.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              I then adopted <strong>FastAI Tabular</strong>, following Jeremy Howard’s practical deep learning approach. FastAI Tabular was a good fit because it bundles preprocessing and model in one artifact and handles categorical embeddings out of the box. That improved accuracy meaningfully and simplified deployment: one export, one load at startup.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Tree models like <strong>CatBoost</strong> handle categorical structure and tabular noise differently from neural tabular models. Adding CatBoost and blending it with FastAI in <strong>log-space</strong> reduced large errors and improved overall reliability. The ensemble isn’t just “two models”; it’s a deliberate choice to combine complementary inductive biases and smooth out tail behavior.
            </p>
          </div>
        </section>

        {/* 3. Final Architecture */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Final Architecture
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              The pipeline is: <strong>Data → Feature engineering → Models → Ensemble → API → Website</strong>. Raw listings are cleaned and transformed with the same code path in training and inference. Features feed two models: FastAI Tabular (embeddings for categoricals, nonlinear interactions, bundled preprocessing) and CatBoost (strong categorical handling, complementary inductive bias). Predictions are combined with a weighted blend in log-space, which reduces variance and tail errors. The API loads the ensemble at startup and serves the website; no backend behavior or prediction API is changed by this page—only how we explain the system.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Using an ensemble instead of a single model gives better robustness: when one model misbehaves on a segment, the other can compensate. The blend weights are fixed after evaluation (e.g. 60% FastAI, 40% CatBoost) and stored in config so deployment is reproducible.
            </p>
          </div>
        </section>

        {/* 4. Feature Engineering Strategy */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Feature Engineering Strategy
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              The model uses <strong>region-based market segmentation</strong>, vehicle age and mileage (and their interactions), and <strong>logarithmic scaling</strong> where it helps stability. Cross-features (e.g. make×model, region×make) and bucketed time/age features are built from a single, shared preprocessing module used in both training and inference. That prevents train/serve skew: the same transformations and encodings are applied at prediction time as in the evaluation pipeline.
            </p>
          </div>
        </section>

        {/* 5. Evaluation Methodology */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Evaluation Methodology
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Evaluation is designed to be reproducible and trustworthy. A fixed train/validation/test split is stored (e.g. in <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">split_indices.json</code>) and reused for every run. The same preprocessing pipeline used in training is used when computing test metrics, so we’re not measuring on a different distribution. Metrics (MAE, RMSE, within ±10%, ±15%, R²) are tracked for every run and written to <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">training_metrics.json</code>. The evaluation script is built to avoid leakage (e.g. no future information, no test data in training). That discipline is what makes the numbers below interpretable and comparable across iterations.
            </p>
          </div>
        </section>

        {/* 6. Results (before/after table) */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Results
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : metricsError && !hasComparison ? (
            <p className="text-slate-500 dark:text-slate-400">{metricsError}</p>
          ) : hasComparison ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <th className="p-4 font-semibold text-slate-900 dark:text-white">Metric</th>
                      <th className="p-4 font-semibold text-slate-900 dark:text-white">Legacy (baseline)</th>
                      <th className="p-4 font-semibold text-slate-900 dark:text-white">FastAI Tabular</th>
                      <th className="p-4 font-semibold text-slate-900 dark:text-white">Ensemble (FastAI + CatBoost)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="p-4 text-slate-600 dark:text-slate-400">MAE</td>
                      <td className="p-4 font-mono">{formatMae(legacy?.mae)}</td>
                      <td className="p-4 font-mono">{formatMae(fastaiTest?.mae)}</td>
                      <td className="p-4 font-mono font-medium text-green-600 dark:text-green-400">{formatMae(blendTest?.mae)}</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="p-4 text-slate-600 dark:text-slate-400">Within ±10%</td>
                      <td className="p-4 font-mono">{formatPct(legacy?.within_10pct)}</td>
                      <td className="p-4 font-mono">{formatPct(fastaiTest?.within_10pct)}</td>
                      <td className="p-4 font-mono font-medium text-green-600 dark:text-green-400">{formatPct(blendTest?.within_10pct)}</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="p-4 text-slate-600 dark:text-slate-400">Within ±15%</td>
                      <td className="p-4 font-mono">{formatPct(legacy?.within_15pct)}</td>
                      <td className="p-4 font-mono">{formatPct(fastaiTest?.within_15pct)}</td>
                      <td className="p-4 font-mono font-medium text-green-600 dark:text-green-400">{formatPct(blendTest?.within_15pct)}</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-slate-600 dark:text-slate-400">R²</td>
                      <td className="p-4 font-mono">—</td>
                      <td className="p-4 font-mono">{formatR2(fastaiTest?.r2)}</td>
                      <td className="p-4 font-mono font-medium text-green-600 dark:text-green-400">{formatR2(blendTest?.r2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                The ensemble reduces average error compared to the legacy baseline (e.g. MAE from ~$3,269 to ~${blendTest?.mae != null ? Math.round(blendTest.mae).toLocaleString() : '—'}) and improves the proportion of predictions within ±10% by a clear margin (e.g. from {legacy?.within_10pct != null ? legacy.within_10pct.toFixed(0) : '—'}% to {blendTest?.within_10pct != null ? blendTest.within_10pct.toFixed(0) : '—'}%). Those gains reflect the move to FastAI plus CatBoost and a reproducible evaluation setup—meaningful improvements for real-world use.
              </p>
            </>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Comparison data is not available. Run training and evaluation to populate training_metrics.json.</p>
          )}
        </section>

        {/* Live metrics cards (current model) */}
        {modelInfo && (
          <section className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Current Deployment
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              The API is serving a <strong>{modelInfo.model_type.replace(/_/g, ' ')}</strong> model
              {modelInfo.weights?.fastai != null && modelInfo.weights?.catboost != null && (
                <> (blend: {Math.round((modelInfo.weights.fastai ?? 0) * 100)}% FastAI, {Math.round((modelInfo.weights.catboost ?? 0) * 100)}% CatBoost)</>
              )}.
              {modelInfo.trained_at && (
                <> Last trained: {new Date(modelInfo.trained_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.</>
              )}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {modelInfo.metrics?.mae != null && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-medium">MAE</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    ${Math.round(modelInfo.metrics.mae).toLocaleString()}
                  </p>
                </div>
              )}
              {modelInfo.metrics?.within_10pct != null && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-medium">Within ±10%</span>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {modelInfo.metrics.within_10pct.toFixed(1)}%
                  </p>
                </div>
              )}
              {modelInfo.metrics?.within_15pct != null && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <Percent className="w-4 h-4" />
                    <span className="text-xs font-medium">Within ±15%</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {modelInfo.metrics.within_15pct.toFixed(1)}%
                  </p>
                </div>
              )}
              {modelInfo.metrics?.r2 != null && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <Scale className="w-4 h-4" />
                    <span className="text-xs font-medium">R²</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {modelInfo.metrics.r2.toFixed(3)}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 7. Engineering Challenges */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Engineering Challenges Encountered
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              <strong>FastAI batch prediction mismatch.</strong> During evaluation, batch prediction sometimes produced different ordering or scaling than single-sample inference. Fix: align evaluation to use the same prediction path and output scale (e.g. log-space then exp) as the serving API, and validate on a held-out slice.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Preprocessing parity.</strong> Early on, inference used slightly different defaults or encodings than training. Fix: a single feature-engineering module shared by the training script and the server; no duplicate logic.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Split reproducibility.</strong> Random splits made it hard to compare runs. Fix: persist train/validation/test indices to disk and reuse them in every evaluation and in any script that reports metrics.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Data leakage.</strong> Risk of using information that wouldn’t be available at prediction time (e.g. global stats from the full dataset). Fix: compute any aggregates from the training fold only and apply them consistently at serve time.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Extreme price outliers.</strong> A few listings with implausible prices could skew metrics and gradients. Fix: sensible clipping and filtering in the data pipeline, and training with a loss that down-weights extreme residuals where appropriate.
            </p>
          </div>
        </section>

        {/* 8. Production Deployment */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Production Deployment
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Models are exported and versioned (e.g. <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">export.pkl</code>, <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">catboost.cbm</code>, configs). The API loads the ensemble at startup and serves <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">/predict</code> and <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">/model_info</code>. The website pulls metrics dynamically from <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">/model_info</code> and, for the comparison table, from the full metrics payload. The system can be retrained (fixed split, same preprocessing), re-evaluated, and redeployed with the same artifacts and config—reproducible from data to live API.
            </p>
          </div>
        </section>

        {/* 9. Future Improvements */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Future Improvements
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Possible next steps: <strong>stacking</strong> instead of a fixed-weight blend for a meta-learner; <strong>uncertainty estimates</strong> (e.g. prediction intervals or conformal prediction) for better calibration; <strong>richer text features</strong> from listing descriptions; and <strong>online or periodic retraining</strong> as new sale outcomes are collected. These are scoped as incremental improvements on top of the current production stack.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Disclaimer</h3>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Price predictions are estimates based on historical data and statistical modeling. Actual market prices can vary. Use them as one input among others; consider a professional appraisal for significant transactions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <section className="bg-gradient-to-br from-green-600 to-slate-700 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6" />
            <h2 className="text-xl font-bold">Help Improve the Model</h2>
          </div>
          <p className="text-green-100 mb-6">
            If you sell your car, you can optionally share the actual sale price. Submissions are anonymous and used to improve future models.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/feedback" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors">
              Submit Actual Sale Price
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors">
              Try the Predictor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
