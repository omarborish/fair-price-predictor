'use client';

import { cn } from '@/lib/utils';

interface AdSlotProps {
  position: 'header' | 'sidebar' | 'in-content' | 'footer';
  className?: string;
}

const adSizes: Record<string, { width: string; height: string; label: string }> = {
  header: { width: 'w-full', height: 'h-24', label: 'Leaderboard Ad (728x90)' },
  sidebar: { width: 'w-full', height: 'h-64', label: 'Sidebar Ad (300x250)' },
  'in-content': { width: 'w-full', height: 'h-32', label: 'In-Content Ad (468x60)' },
  footer: { width: 'w-full', height: 'h-24', label: 'Footer Ad (728x90)' },
};

export function AdSlot({ position, className }: AdSlotProps) {
  const size = adSizes[position];

  return (
    <div
      className={cn(
        'ad-slot rounded-lg flex items-center justify-center',
        size.width,
        size.height,
        className
      )}
      data-ad-slot={position}
    >
      <div className="text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          ADVERTISEMENT
        </p>
        <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
          {size.label}
        </p>
        {/* Google AdSense placeholder - replace with actual ad code */}
        {/* 
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
        */}
      </div>
    </div>
  );
}
