import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works | Fair Price Used Car Predictor',
  description: 'Understand the data science behind our used car price predictions: data collection, cleaning, feature engineering, gradient boosting model training, and prediction intervals.',
  openGraph: {
    title: 'How Fair Price Predictor Works',
    description: 'A 6-step machine learning pipeline that estimates fair market values for used cars using real listing data.',
  },
};

export default function MethodologyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
