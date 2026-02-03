import { NextResponse } from 'next/server';
import { getMonthlyAnalytics, isAnalyticsConfigured } from '@/lib/analytics-api';

// Sample data for when Umami is not configured
const sampleData = [
  { month: '2025-08', visits: 1250, pageviews: 3500, visitors: 980, avg_session_duration: 145.5, pages_per_visit: 2.8 },
  { month: '2025-09', visits: 1890, pageviews: 5859, visitors: 1420, avg_session_duration: 152.3, pages_per_visit: 3.1 },
  { month: '2025-10', visits: 2340, pageviews: 6786, visitors: 1750, avg_session_duration: 148.7, pages_per_visit: 2.9 },
  { month: '2025-11', visits: 2780, pageviews: 8896, visitors: 2100, avg_session_duration: 156.2, pages_per_visit: 3.2 },
  { month: '2025-12', visits: 3150, pageviews: 10710, visitors: 2400, avg_session_duration: 162.8, pages_per_visit: 3.4 },
  { month: '2026-01', visits: 3520, pageviews: 11616, visitors: 2650, avg_session_duration: 158.4, pages_per_visit: 3.3 },
];

export async function GET() {
  try {
    // Check if Umami is configured
    if (isAnalyticsConfigured()) {
      const data = await getMonthlyAnalytics(6);
      return NextResponse.json({
        data,
        source: 'umami',
        lastUpdated: new Date().toISOString(),
      });
    }

    // Return sample data if not configured
    return NextResponse.json({
      data: sampleData,
      source: 'sample',
      lastUpdated: new Date().toISOString(),
      note: 'Using sample data. Configure UMAMI_API_KEY and NEXT_PUBLIC_UMAMI_WEBSITE_ID for live analytics.',
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({
      data: sampleData,
      source: 'fallback',
      lastUpdated: new Date().toISOString(),
      error: 'Failed to fetch live analytics',
    });
  }
}
