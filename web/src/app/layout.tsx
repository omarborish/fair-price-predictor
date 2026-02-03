import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CookieConsent } from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: 'Fair Price Used Car Predictor | Get Accurate Market Values',
  description: 'Get instant, accurate fair market price estimates for any used car. Our AI-powered tool analyzes millions of listings to give you confidence in your car buying or selling decision.',
  keywords: 'used car price, car value estimator, fair market value, car price calculator, used car pricing tool',
  authors: [{ name: 'Fair Price Predictor' }],
  openGraph: {
    title: 'Fair Price Used Car Predictor',
    description: 'Get accurate fair market price estimates for any used car in seconds.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fair Price Used Car Predictor',
    description: 'Get accurate fair market price estimates for any used car in seconds.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1370563938469727"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
