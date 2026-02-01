'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay showing the banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Cookie className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Cookie Preferences
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              We use cookies to enhance your experience and analyze site traffic. 
              By clicking "Accept All", you consent to our use of cookies for analytics and advertising.
              Read our{' '}
              <Link href="/privacy#cookies" className="text-green-600 hover:underline">
                Cookie Policy
              </Link>{' '}
              for more information.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={acceptAll}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={acceptEssential}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
              >
                Essential Only
              </button>
            </div>
          </div>

          <button
            onClick={acceptEssential}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
