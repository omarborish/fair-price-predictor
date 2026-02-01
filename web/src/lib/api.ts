const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CarDetails {
  year: number;
  manufacturer: string;
  model: string;
  odometer: number;
  condition?: string;
  fuel?: string;
  transmission?: string;
  drive?: string;
  type?: string;
  paint_color?: string;
  state?: string;
  cylinders?: string;
  title_status?: string;
}

export interface FeatureImpact {
  feature: string;
  effect: string;
  impact_value: number;
  direction: 'positive' | 'negative';
}

export interface ComparableCar {
  price: number;
  year: number;
  manufacturer: string;
  model: string;
  odometer: number;
  condition?: string | null;
  transmission?: string | null;
  fuel?: string | null;
  drive?: string | null;
  type?: string | null;
  state?: string | null;
  image_url?: string | null;
  listing_url?: string | null;
  similarity_score: number;
}

export interface PredictionResponse {
  predicted_price: number;
  price_range: {
    low: number;
    high: number;
  };
  confidence_score: number;
  feature_impacts: FeatureImpact[];
  comparables: ComparableCar[];
  percentile_vs_market: number;
  price_label: string;
  summary: string;
}

export interface DropdownOptions {
  manufacturers: string[];
  fuels: string[];
  transmissions: string[];
  drives: string[];
  types: string[];
  conditions: string[];
  states: string[];
  years: number[];
}

export async function predictPrice(carDetails: CarDetails): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(carDetails),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get prediction');
  }

  return response.json();
}

export async function getDropdowns(): Promise<DropdownOptions> {
  const response = await fetch(`${API_BASE}/dropdowns`);
  
  if (!response.ok) {
    throw new Error('Failed to load dropdown options');
  }

  return response.json();
}

export async function getInsights(): Promise<any> {
  const response = await fetch(`${API_BASE}/insights`);
  
  if (!response.ok) {
    throw new Error('Failed to load insights');
  }

  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// DEPENDENT DROPDOWN APIs
// ============================================================================

export interface MakeOption {
  value: string;
  label: string;
  count: number;
}

export interface ModelOption {
  value: string;
  label: string;
  count: number;
}

export interface ModelDetails {
  make: string;
  model: string;
  fuels: string[];
  types: string[];
  drives: string[];
  transmissions: string[];
  fallback?: boolean;
}

export interface CommonDefaults {
  make: string;
  model: string;
  fuel: string;
  type: string;
  drive: string;
  transmission: string;
}

export async function getMakes(): Promise<{ makes: MakeOption[]; total: number }> {
  const response = await fetch(`${API_BASE}/options/makes`);
  
  if (!response.ok) {
    throw new Error('Failed to load makes');
  }
  
  return response.json();
}

export async function getModels(make: string): Promise<{ models: ModelOption[]; make: string; total: number }> {
  const response = await fetch(`${API_BASE}/options/models?make=${encodeURIComponent(make)}`);
  
  if (!response.ok) {
    throw new Error('Failed to load models');
  }
  
  return response.json();
}

export async function getModelDetails(make: string, model: string): Promise<ModelDetails> {
  const response = await fetch(`${API_BASE}/options/details?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
  
  if (!response.ok) {
    throw new Error('Failed to load model details');
  }
  
  return response.json();
}

export async function getCommonDefaults(make: string, model: string): Promise<CommonDefaults> {
  const response = await fetch(`${API_BASE}/options/common?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
  
  if (!response.ok) {
    throw new Error('Failed to load common defaults');
  }
  
  return response.json();
}
