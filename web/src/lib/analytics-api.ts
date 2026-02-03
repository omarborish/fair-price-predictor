/**
 * Umami Analytics API Client
 * 
 * Fetches aggregated analytics data from Umami's API
 * for display on the public analytics page.
 */

const UMAMI_API_URL = process.env.UMAMI_API_URL || 'https://cloud.umami.is';
const UMAMI_API_KEY = process.env.UMAMI_API_KEY;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export interface AnalyticsStats {
  pageviews: { value: number; change: number };
  visitors: { value: number; change: number };
  visits: { value: number; change: number };
  bounces: { value: number; change: number };
  totaltime: { value: number; change: number };
}

export interface PageviewsData {
  x: string; // date
  y: number; // pageviews
}

export interface MonthlyData {
  month: string;
  visits: number;
  pageviews: number;
  visitors: number;
  avg_session_duration: number;
  pages_per_visit: number;
}

/**
 * Get website stats for a date range
 */
export async function getWebsiteStats(
  startAt: number,
  endAt: number
): Promise<AnalyticsStats | null> {
  if (!UMAMI_API_KEY || !UMAMI_WEBSITE_ID) {
    return null;
  }

  try {
    const response = await fetch(
      `${UMAMI_API_URL}/api/websites/${UMAMI_WEBSITE_ID}/stats?startAt=${startAt}&endAt=${endAt}`,
      {
        headers: {
          'Authorization': `Bearer ${UMAMI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.error('Umami API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Umami stats:', error);
    return null;
  }
}

/**
 * Get pageviews over time
 */
export async function getPageviews(
  startAt: number,
  endAt: number,
  unit: 'hour' | 'day' | 'week' | 'month' | 'year' = 'day'
): Promise<PageviewsData[] | null> {
  if (!UMAMI_API_KEY || !UMAMI_WEBSITE_ID) {
    return null;
  }

  try {
    const response = await fetch(
      `${UMAMI_API_URL}/api/websites/${UMAMI_WEBSITE_ID}/pageviews?startAt=${startAt}&endAt=${endAt}&unit=${unit}`,
      {
        headers: {
          'Authorization': `Bearer ${UMAMI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.pageviews || [];
  } catch (error) {
    console.error('Failed to fetch pageviews:', error);
    return null;
  }
}

/**
 * Get monthly aggregated data for the analytics page
 */
export async function getMonthlyAnalytics(months: number = 6): Promise<MonthlyData[]> {
  const results: MonthlyData[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    
    const stats = await getWebsiteStats(
      monthStart.getTime(),
      monthEnd.getTime()
    );

    if (stats) {
      const visits = stats.visits.value || 0;
      const pageviews = stats.pageviews.value || 0;
      const totalTime = stats.totaltime.value || 0;

      results.push({
        month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
        visits,
        pageviews,
        visitors: stats.visitors.value || 0,
        avg_session_duration: visits > 0 ? totalTime / visits : 0,
        pages_per_visit: visits > 0 ? pageviews / visits : 0,
      });
    } else {
      // Return placeholder if API not configured
      results.push({
        month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
        visits: 0,
        pageviews: 0,
        visitors: 0,
        avg_session_duration: 0,
        pages_per_visit: 0,
      });
    }
  }

  return results;
}

/**
 * Check if analytics API is configured
 */
export function isAnalyticsConfigured(): boolean {
  return !!(UMAMI_API_KEY && UMAMI_WEBSITE_ID);
}
