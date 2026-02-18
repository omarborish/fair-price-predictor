/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image configuration for external car images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.craigslist.org',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'images.craigslist.org',
        pathname: '**',
      },
    ],
    unoptimized: true,
  },
  
  // Redirect old /model page to combined /methodology page
  async redirects() {
    return [
      { source: '/model', destination: '/methodology', permanent: true },
    ];
  },
  // API rewrites for development
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  
  // Security headers for production
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // Optional defense-in-depth: same-origin allows our origin; third-party embeds (AdSense, Umami) load their own resources
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          // CSP Report-Only: safe baseline for AdSense + Umami; enforce later after monitoring reports
          // Umami: cloud.umami.is + api-gateway.umami.dev (send endpoint). Google: pagead + ad traffic quality.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://cloud.umami.is https://*.umami.is https://ep2.adtrafficquality.google",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: http:",
              "connect-src 'self' https://*.supabase.co https://cloud.umami.is https://*.umami.is https://api-gateway.umami.dev https://ep1.adtrafficquality.google",
              "frame-src https://googleads.g.doubleclick.net https://ep2.adtrafficquality.google https://www.google.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  // Powered by header removed for security
  poweredByHeader: false,
};

module.exports = nextConfig;
