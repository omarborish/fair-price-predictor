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
