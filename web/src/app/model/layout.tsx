import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Model & Accuracy | Fair Price Used Car Predictor',
  description: 'Explore our machine learning model performance: accuracy metrics, error analysis, feature importance, and comparative evaluation for used car price predictions.',
  openGraph: {
    title: 'Model & Accuracy — Fair Price Predictor',
    description: 'See how accurate our AI model is at predicting used car prices.',
  },
};

export default function ModelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
