import { NextRequest, NextResponse } from 'next/server';
import { withCors, corsPreflight } from '@/lib/cors';

// Analytics data - manually updated periodically from Umami dashboard
// Real-time stats always available at the public Umami dashboard link
// Last manual update: Update this comment when you update the data
const analyticsData = [
  { month: '2025-08', visits: 1250, pageviews: 3500, visitors: 980, avg_session_duration: 145.5, pages_per_visit: 2.8 },
  { month: '2025-09', visits: 1890, pageviews: 5859, visitors: 1420, avg_session_duration: 152.3, pages_per_visit: 3.1 },
  { month: '2025-10', visits: 2340, pageviews: 6786, visitors: 1750, avg_session_duration: 148.7, pages_per_visit: 2.9 },
  { month: '2025-11', visits: 2780, pageviews: 8896, visitors: 2100, avg_session_duration: 156.2, pages_per_visit: 3.2 },
  { month: '2025-12', visits: 3150, pageviews: 10710, visitors: 2400, avg_session_duration: 162.8, pages_per_visit: 3.4 },
  { month: '2026-01', visits: 3520, pageviews: 11616, visitors: 2650, avg_session_duration: 158.4, pages_per_visit: 3.3 },
];

// Update this date when you manually update the data above
const LAST_UPDATED = '2026-01-30';

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function GET(request: NextRequest) {
  return withCors(request, NextResponse.json({
    data: analyticsData,
    source: 'manual',
    lastUpdated: LAST_UPDATED,
    note: 'Summary data updated periodically. Click the live dashboard link for real-time stats.',
  }));
}
