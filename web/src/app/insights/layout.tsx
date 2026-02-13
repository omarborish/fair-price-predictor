import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Insights | Fair Price Used Car Predictor',
  description: 'Data-driven used car market insights: depreciation trends, mileage impact, fuel type comparisons, drivetrain premiums, and price distributions.',
  openGraph: {
    title: 'Used Car Market Insights — Fair Price Predictor',
    description: 'Explore interactive charts and data on how year, mileage, fuel type, and drivetrain affect used car prices.',
  },
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
