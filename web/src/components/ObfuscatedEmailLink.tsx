'use client';

import { useEffect, useState } from 'react';

/**
 * Renders a mailto link whose href is set only on the client from an obfuscated value.
 * Avoids plain-text email in SSR HTML for crawlers while keeping the link working for users.
 */
export function ObfuscatedEmailLink({
  encoded,
  children,
  className,
  ariaLabel = 'Email',
}: {
  encoded: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const [href, setHref] = useState<string>('#');

  useEffect(() => {
    try {
      const decoded = atob(encoded);
      if (decoded.includes('@')) {
        setHref(`mailto:${decoded}`);
      }
    } catch {
      // leave href as #
    }
  }, [encoded]);

  return (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
