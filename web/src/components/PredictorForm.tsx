'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CarDetails, 
  DropdownOptions, 
  getDropdowns, 
  getMakes, 
  getModels, 
  getModelDetails,
  getCommonDefaults,
  MakeOption,
  ModelOption,
  ModelDetails
} from '@/lib/api';

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
  
  // Dependent dropdown state
  const [makes, setMakes] = useState<MakeOption[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [modelDetails, setModelDetails] = useState<ModelDetails | null>(null);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  // Load initial data
  useEffect(() => {
    // Load makes for dependent dropdowns
    getMakes()
      .then(data => {
        setMakes(data.makes);
        setLoadingMakes(false);
      })
      .catch(() => {
        // Fallback to regular dropdowns
        getDropdowns()
          .then(setDropdowns)
          .catch(() => {});
        setLoadingMakes(false);
      });
    
    // Also load regular dropdowns for states, conditions, etc.
    getDropdowns()
      .then(setDropdowns)
      .catch(() => {});
  }, []);

  // Load models when make changes
  useEffect(() => {
    if (!formData.manufacturer) {
      setModels([]);
      setModelDetails(null);
      return;
    }

    setLoadingModels(true);
    getModels(formData.manufacturer)
      .then(data => {
        setModels(data.models);
        setLoadingModels(false);
      })
      .catch(() => {
        setModels([]);
        setLoadingModels(false);
      });
  }, [formData.manufacturer]);

  // Load model details when model changes
  useEffect(() => {
    if (!formData.manufacturer || !formData.model) {
      setModelDetails(null);
      return;
    }

    setLoadingDetails(true);
    
    // Get both details and common defaults
    Promise.all([
      getModelDetails(formData.manufacturer, formData.model),
      getCommonDefaults(formData.manufacturer, formData.model)
    ])
      .then(([details, defaults]) => {
        setModelDetails(details);
        
        // Auto-fill with common defaults
        setFormData(prev => ({
          ...prev,
          fuel: defaults.fuel || prev.fuel,
          type: defaults.type || prev.type,
          drive: defaults.drive || prev.drive,
          transmission: defaults.transmission || prev.transmission,
        }));
        
        setLoadingDetails(false);
      })
      .catch(() => {
        setModelDetails(null);
        setLoadingDetails(false);
      });
  }, [formData.manufacturer, formData.model]);

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

  const handleMakeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      manufacturer: value,
      model: '', // Reset model when make changes
    }));
    setModels([]);
    setModelDetails(null);
    if (errors.manufacturer) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.manufacturer;
        return newErrors;
      });
    }
  };

  const handleModelChange = (value: string) => {
    setFormData(prev => ({ ...prev, model: value }));
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

  // Get available options (from modelDetails or fallback to defaults)
  const availableFuels = modelDetails?.fuels?.length ? modelDetails.fuels : dropdowns.fuels;
  const availableTypes = modelDetails?.types?.length ? modelDetails.types : dropdowns.types;
  const availableDrives = modelDetails?.drives?.length ? modelDetails.drives : dropdowns.drives;
  const availableTransmissions = modelDetails?.transmissions?.length ? modelDetails.transmissions : dropdowns.transmissions;

  const hasModelSelected = formData.manufacturer && formData.model;

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

        {/* Manufacturer (Make) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Make <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.manufacturer}
              onChange={(e) => handleMakeChange(e.target.value)}
              disabled={loadingMakes}
              className={cn(
                'w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors',
                errors.manufacturer ? 'border-red-500' : 'border-slate-300 dark:border-slate-600',
                loadingMakes && 'opacity-50'
              )}
            >
              <option value="">Select make...</option>
              {makes.length > 0 ? (
                makes.map(make => (
                  <option key={make.value} value={make.value}>
                    {make.label} ({make.count.toLocaleString()} listings)
                  </option>
                ))
              ) : (
                dropdowns.manufacturers.map(mfr => (
                  <option key={mfr} value={mfr}>
                    {mfr.charAt(0).toUpperCase() + mfr.slice(1)}
                  </option>
                ))
              )}
            </select>
            {loadingMakes && (
              <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
            )}
          </div>
          {errors.manufacturer && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.manufacturer}
            </p>
          )}
        </div>

        {/* Model - Dependent Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Model
            {!formData.manufacturer && (
              <span className="ml-2 text-xs text-slate-400">(Select make first)</span>
            )}
          </label>
          <div className="relative">
            <select
              value={formData.model}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={!formData.manufacturer || loadingModels}
              className={cn(
                'w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors',
                (!formData.manufacturer || loadingModels) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <option value="">
                {!formData.manufacturer 
                  ? 'Select a make first...' 
                  : loadingModels 
                    ? 'Loading models...'
                    : models.length > 0 
                      ? 'Select model...'
                      : 'Enter model manually below'}
              </option>
              {models.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label} ({model.count.toLocaleString()})
                </option>
              ))}
            </select>
            {loadingModels && (
              <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
            )}
          </div>
          {/* Manual model input fallback */}
          {formData.manufacturer && !formData.model && models.length === 0 && !loadingModels && (
            <input
              type="text"
              placeholder="Or type model name..."
              onChange={(e) => handleChange('model', e.target.value)}
              className="mt-2 w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          )}
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

        {/* Vehicle Type - Dependent on Make+Model */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Vehicle Type
            {loadingDetails && <Loader2 className="inline ml-2 w-3 h-3 animate-spin" />}
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            {availableTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          {hasModelSelected && modelDetails && !modelDetails.fallback && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Options based on {formData.manufacturer} {formData.model}
            </p>
          )}
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
          {/* Transmission - Dependent */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Transmission
            </label>
            <select
              value={formData.transmission}
              onChange={(e) => handleChange('transmission', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              {availableTransmissions.map(trans => (
                <option key={trans} value={trans}>
                  {trans.charAt(0).toUpperCase() + trans.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type - Dependent */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fuel Type
            </label>
            <select
              value={formData.fuel}
              onChange={(e) => handleChange('fuel', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              {availableFuels.map(fuel => (
                <option key={fuel} value={fuel}>
                  {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Drive Type - Dependent */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Drive Type
            </label>
            <select
              value={formData.drive}
              onChange={(e) => handleChange('drive', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              {availableDrives.map(drive => (
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
