'use client';

import Script from 'next/script';

/**
 * Umami Analytics Component
 * 
 * Umami is a privacy-focused, open-source analytics solution.
 * It doesn't use cookies and is GDPR compliant by default.
 * 
 * Setup options:
 * 1. Self-hosted: Deploy Umami on your own server (free)
 * 2. Umami Cloud: Use their hosted service (free tier available)
 * 
 * Get your Website ID from your Umami dashboard after adding your site.
 */

const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC || 'https://cloud.umami.is/script.js';

export function UmamiAnalytics() {
  // Don't render if no website ID is configured
  if (!UMAMI_WEBSITE_ID) {
    return null;
  }

  return (
    <Script
      async
      src={UMAMI_SRC}
      data-website-id={UMAMI_WEBSITE_ID}
      strategy="afterInteractive"
    />
  );
}

/**
 * Track custom events with Umami
 * Usage: trackEvent('button_click', { button: 'predict' })
 */
export function trackEvent(eventName: string, eventData?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && (window as any).umami) {
    (window as any).umami.track(eventName, eventData);
  }
}

/**
 * Track page views manually (usually automatic)
 * Usage: trackPageView('/custom-path')
 */
export function trackPageView(url?: string) {
  if (typeof window !== 'undefined' && (window as any).umami) {
    (window as any).umami.track((props: Record<string, unknown>) => ({
      ...props,
      url: url || window.location.pathname,
    }));
  }
}
