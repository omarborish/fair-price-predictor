'use client';

import { cn } from '@/lib/utils';

interface AdSlotProps {
  position: 'header' | 'sidebar' | 'in-content' | 'footer';
  className?: string;
}

const adConfig: Record<string, { minHeight: string; label: string }> = {
  header: { minHeight: 'min-h-[90px]', label: 'Advertisement' },
  sidebar: { minHeight: 'min-h-[250px]', label: 'Advertisement' },
  'in-content': { minHeight: 'min-h-[100px]', label: 'Advertisement' },
  footer: { minHeight: 'min-h-[90px]', label: 'Advertisement' },
};

export function AdSlot({ position, className }: AdSlotProps) {
  const config = adConfig[position];

  // Production: Replace this with actual AdSense code
  // For now, render a subtle placeholder that reserves space

  return (
    <div
      className={cn(
        'w-full rounded-lg border border-dashed border-slate-200 dark:border-slate-700',
        'bg-slate-50/50 dark:bg-slate-800/30',
        'flex items-center justify-center',
        config.minHeight,
        className
      )}
      data-ad-slot={position}
      aria-label="Advertisement"
    >
      <span className="text-xs text-slate-300 dark:text-slate-600 font-medium tracking-wide">
        {config.label}
      </span>
      
      {/* 
        GOOGLE ADSENSE INTEGRATION
        ==========================
        After AdSense approval, replace the placeholder above with:
        
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
        
        And add the AdSense script to layout.tsx:
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      */}
    </div>
  );
}
