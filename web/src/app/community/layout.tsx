import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community | Fair Price Used Car Predictor',
  description: 'Join the Fair Price Predictor community. Share your experience, ask questions, and help others make informed used car buying decisions.',
  openGraph: {
    title: 'Community — Fair Price Predictor',
    description: 'Read and share experiences about used car pricing.',
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
