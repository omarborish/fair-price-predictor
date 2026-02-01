'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Copy, Check,
  Gauge, Calendar, Car, Info, Sparkles, MapPin, 
  ExternalLink, ChevronDown, ChevronUp, ImageOff,
  ArrowUpDown, HelpCircle, X
} from 'lucide-react';
import { cn, formatPrice, formatNumber, titleCase } from '@/lib/utils';
import { PredictionResponse, ComparableCar } from '@/lib/api';
import { PriceDistributionChart } from './charts/PriceDistributionChart';
import { FeatureImpactChart } from './charts/FeatureImpactChart';
import Image from 'next/image';

type SortOption = 'match' | 'price_low' | 'price_high' | 'mileage_low';

interface PredictionResultProps {
  result: PredictionResponse;
  carDetails: {
    year: number;
    manufacturer: string;
    model: string;
    odometer: number;
  };
}

export function PredictionResult({ result, carDetails }: PredictionResultProps) {
  const [copied, setCopied] = useState(false);
  const [showAllComparables, setShowAllComparables] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [showSimilarityInfo, setShowSimilarityInfo] = useState(false);

  const priceColor = {
    'Great Value': 'from-blue-600 to-blue-500',
    'Good Deal': 'from-green-600 to-green-500',
    'Fair Price': 'from-green-600 to-green-500',
    'Slightly High': 'from-amber-500 to-amber-400',
    'Above Market': 'from-red-500 to-red-400',
  }[result.price_label] || 'from-green-600 to-green-500';

  const handleShare = async () => {
    const shareText = `Fair Price Estimate for ${carDetails.year} ${titleCase(carDetails.manufacturer)} ${titleCase(carDetails.model || '')}\n\nPredicted Price: ${formatPrice(result.predicted_price)}\nPrice Range: ${formatPrice(result.price_range.low)} - ${formatPrice(result.price_range.high)}\nMarket Position: ${result.price_label}\n\nGet your own estimate at FairPricePredictor.com`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
    }
  };

  // Sort comparables based on selected option
  const sortedComparables = useMemo(() => {
    const sorted = [...result.comparables];
    switch (sortBy) {
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'mileage_low':
        return sorted.sort((a, b) => a.odometer - b.odometer);
      case 'match':
      default:
        return sorted.sort((a, b) => b.similarity_score - a.similarity_score);
    }
  }, [result.comparables, sortBy]);

  const displayedComparables = showAllComparables 
    ? sortedComparables 
    : sortedComparables.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${priceColor} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">AI Price Estimate</span>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
              {result.price_label}
            </span>
          </div>
          
          <div className="text-center">
            <p className="text-white/80 text-sm mb-2">Estimated Fair Market Price</p>
            <p className="text-5xl sm:text-6xl font-bold tracking-tight">
              {formatPrice(result.predicted_price)}
            </p>
            <p className="mt-3 text-white/80">
              Range: {formatPrice(result.price_range.low)} - {formatPrice(result.price_range.high)}
            </p>
          </div>
        </div>

        {/* Car Info */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{carDetails.year}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              <span>{titleCase(carDetails.manufacturer)} {titleCase(carDetails.model || '')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              <span>{formatNumber(carDetails.odometer)} miles</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-slate-200 dark:bg-slate-700">
          <div className="bg-white dark:bg-slate-800 p-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Confidence</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {Math.round(result.confidence_score * 100)}%
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Market Percentile</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {result.percentile_vs_market}%
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-800 p-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Similar Cars</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {result.comparables.length}
            </p>
          </div>
        </div>

        {/* Share Button */}
        <div className="p-4 bg-white dark:bg-slate-800">
          <button
            onClick={handleShare}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Share This Estimate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feature Impacts */}
      {result.feature_impacts.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            What's Affecting the Price
          </h3>
          
          <div className="space-y-3">
            {result.feature_impacts.map((impact, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl',
                  impact.direction === 'positive'
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                )}
              >
                <div className="flex items-center gap-3">
                  {impact.direction === 'positive' ? (
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {impact.feature}
                  </span>
                </div>
                <span
                  className={cn(
                    'font-semibold',
                    impact.direction === 'positive'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {impact.effect}
                </span>
              </div>
            ))}
          </div>
          
          <FeatureImpactChart impacts={result.feature_impacts} />
        </div>
      )}

      {/* Price Distribution */}
      {result.comparables.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            Price Distribution of Similar Cars
          </h3>
          <PriceDistributionChart 
            comparables={result.comparables} 
            predictedPrice={result.predicted_price}
          />
        </div>
      )}

      {/* Similar Listings Gallery */}
      {result.comparables.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          {/* Header with Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Similar Listings
              </h3>
              <button
                onClick={() => setShowSimilarityInfo(true)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="How we find similar cars"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            
            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-700 dark:text-slate-200"
              >
                <option value="match">Best Match</option>
                <option value="price_low">Lowest Price</option>
                <option value="price_high">Highest Price</option>
                <option value="mileage_low">Lowest Mileage</option>
              </select>
            </div>
          </div>
          
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {displayedComparables.map((car, index) => (
              <ComparableCarCard key={`${car.year}-${car.manufacturer}-${car.model}-${index}`} car={car} />
            ))}
          </div>

          {/* View More Button */}
          {result.comparables.length > 4 && (
            <button
              onClick={() => setShowAllComparables(!showAllComparables)}
              className="w-full mt-4 py-3 px-4 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-all"
            >
              {showAllComparables ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  View {result.comparables.length - 4} More Listings
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Similarity Info Modal */}
      {showSimilarityInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowSimilarityInfo(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              How We Find Similar Cars
            </h3>
            
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p>
                We use a weighted similarity algorithm to find the most comparable vehicles:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Make & Model (High):</strong> Same manufacturer and model get priority</li>
                <li><strong>Year (High):</strong> Within 2 years of your vehicle</li>
                <li><strong>Mileage (Medium):</strong> Similar odometer readings (log-scaled)</li>
                <li><strong>Condition (Medium):</strong> Matching condition rating</li>
                <li><strong>Location (Light):</strong> Same state/region when available</li>
              </ul>
              <p className="pt-2">
                The "match %" shows how closely each listing matches your criteria. Higher percentages indicate more similar vehicles.
              </p>
            </div>
            
            <button
              onClick={() => setShowSimilarityInfo(false)}
              className="w-full mt-6 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Summary</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {result.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparableCarCard({ car }: { car: ComparableCar }) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = car.image_url && !imageError;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border border-slate-200 dark:border-slate-700">
      {/* Image Section */}
      <div className="relative h-40 bg-slate-200 dark:bg-slate-700">
        {hasValidImage ? (
          <Image
            src={car.image_url!}
            alt={`${car.year} ${car.manufacturer} ${car.model}`}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <ImageOff className="w-10 h-10 mb-2" />
            <span className="text-xs font-medium">{titleCase(car.manufacturer)}</span>
            <span className="text-sm font-semibold">{titleCase(car.model)}</span>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-2 right-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg">
          {formatPrice(car.price)}
        </div>
        
        {/* Similarity Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white rounded-full text-xs font-medium backdrop-blur-sm">
          {Math.round(car.similarity_score * 100)}% match
        </div>
      </div>
      
      {/* Details Section */}
      <div className="p-4">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
          {car.year} {titleCase(car.manufacturer)} {titleCase(car.model)}
        </h4>
        
        <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            {formatNumber(car.odometer)} mi
          </span>
          {car.condition && car.condition !== 'N/A' && (
            <span>• {titleCase(car.condition)}</span>
          )}
          {car.state && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {car.state.toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {car.transmission && car.transmission !== 'N/A' && (
            <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-300">
              {titleCase(car.transmission)}
            </span>
          )}
          {car.fuel && car.fuel !== 'N/A' && (
            <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-300">
              {titleCase(car.fuel)}
            </span>
          )}
          {car.drive && car.drive !== 'N/A' && (
            <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-300">
              {titleCase(car.drive)}
            </span>
          )}
        </div>
        
        {/* View Listing Link */}
        {car.listing_url && (
          <a
            href={car.listing_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View Original Listing
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
