import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGIN = 'https://fair-price-predictor.vercel.app';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
} as const;

/**
 * Returns the response with CORS headers only when Origin matches the allowed site.
 * Use on API routes only — no global CORS.
 */
export function withCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('Origin');
  if (origin === ALLOWED_ORIGIN) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}

/**
 * Handle OPTIONS preflight for API routes. Call from OPTIONS export.
 */
export function corsPreflight(request: NextRequest): NextResponse {
  const origin = request.headers.get('Origin');
  const res = new NextResponse(null, { status: 204 });
  if (origin === ALLOWED_ORIGIN) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      res.headers.set(key, value);
    });
  }
  res.headers.set('Vary', 'Origin');
  return res;
}
