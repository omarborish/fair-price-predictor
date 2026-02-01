'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CarDetails, DropdownOptions, getDropdowns } from '@/lib/api';

interface PredictorFormProps {
  onSubmit: (carDetails: CarDetails) => void;
  isLoading: boolean;
}

const defaultDropdowns: DropdownOptions = {
  manufacturers: ['ford', 'toyota', 'honda', 'chevrolet', 'nissan', 'bmw', 'mercedes-benz', 'audi', 'volkswagen', 'hyundai', 'kia', 'mazda', 'subaru', 'lexus', 'jeep', 'dodge', 'ram', 'gmc', 'buick', 'cadillac'],
  fuels: ['gas', 'diesel', 'hybrid', 'electric', 'other'],
  transmissions: ['automatic', 'manual', 'other'],
  drives: ['fwd', 'rwd', '4wd'],
  types: ['sedan', 'suv', 'truck', 'coupe', 'hatchback', 'wagon', 'convertible', 'van', 'pickup', 'mini-van', 'other'],
  conditions: ['new', 'like new', 'excellent', 'good', 'fair', 'salvage'],
  states: ['al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'],
  years: Array.from({ length: 35 }, (_, i) => 2025 - i),
};

export function PredictorForm({ onSubmit, isLoading }: PredictorFormProps) {
  const [dropdowns, setDropdowns] = useState<DropdownOptions>(defaultDropdowns);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CarDetails>({
    year: 2020,
    manufacturer: '',
    model: '',
    odometer: 50000,
    condition: 'good',
    fuel: 'gas',
    transmission: 'automatic',
    drive: 'fwd',
    type: 'sedan',
    title_status: 'clean',
  });

  useEffect(() => {
    getDropdowns()
      .then(setDropdowns)
      .catch(() => {
        // Use defaults if API not available
      });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.manufacturer) {
      newErrors.manufacturer = 'Please select a manufacturer';
    }

    if (formData.odometer < 0 || formData.odometer > 500000) {
      newErrors.odometer = 'Mileage must be between 0 and 500,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CarDetails, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Year <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.year}
            onChange={(e) => handleChange('year', parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            {dropdowns.years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Manufacturer */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Make <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.manufacturer}
            onChange={(e) => handleChange('manufacturer', e.target.value)}
            className={cn(
              'w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors',
              errors.manufacturer ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            )}
          >
            <option value="">Select manufacturer...</option>
            {dropdowns.manufacturers.map(mfr => (
              <option key={mfr} value={mfr}>
                {mfr.charAt(0).toUpperCase() + mfr.slice(1)}
              </option>
            ))}
          </select>
          {errors.manufacturer && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.manufacturer}
            </p>
          )}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Model
          </label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="e.g., Camry, Civic, F-150"
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Mileage <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.odometer}
              onChange={(e) => handleChange('odometer', parseInt(e.target.value) || 0)}
              min="0"
              max="500000"
              className={cn(
                'w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors',
                errors.odometer ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              miles
            </span>
          </div>
          {errors.odometer && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.odometer}
            </p>
          )}
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Condition
          </label>
          <select
            value={formData.condition}
            onChange={(e) => handleChange('condition', e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            {dropdowns.conditions.map(cond => (
              <option key={cond} value={cond}>
                {cond.charAt(0).toUpperCase() + cond.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Vehicle Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            {dropdowns.types.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
      </button>

      {/* Advanced Fields */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Transmission
            </label>
            <select
              value={formData.transmission}
              onChange={(e) => handleChange('transmission', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              {dropdowns.transmissions.map(trans => (
                <option key={trans} value={trans}>
                  {trans.charAt(0).toUpperCase() + trans.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fuel Type
            </label>
            <select
              value={formData.fuel}
              onChange={(e) => handleChange('fuel', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              {dropdowns.fuels.map(fuel => (
                <option key={fuel} value={fuel}>
                  {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Drive Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Drive Type
            </label>
            <select
              value={formData.drive}
              onChange={(e) => handleChange('drive', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              {dropdowns.drives.map(drive => (
                <option key={drive} value={drive}>
                  {drive.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Title Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title Status
            </label>
            <select
              value={formData.title_status}
              onChange={(e) => handleChange('title_status', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="clean">Clean</option>
              <option value="rebuilt">Rebuilt</option>
              <option value="salvage">Salvage</option>
              <option value="lien">Lien</option>
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              State
            </label>
            <select
              value={formData.state || ''}
              onChange={(e) => handleChange('state', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">Any State</option>
              {dropdowns.states.map(state => (
                <option key={state} value={state}>
                  {state.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          'w-full py-4 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-3 transition-all',
          isLoading
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-green-500/25'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Get Fair Price Estimate
          </>
        )}
      </button>
    </form>
  );
}
