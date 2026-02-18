import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Methodology | Fair Price Used Car Predictor',
  description: 'Engineering story, architecture, and evaluation: FastAI Tabular, CatBoost ensemble, feature engineering, reproducible metrics, and deployment.',
  openGraph: {
    title: 'Methodology – Fair Price Predictor',
    description: 'How the production ML system was built: iteration journey, final architecture, before/after metrics, and engineering challenges.',
  },
};

export default function MethodologyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
