'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Clock, FileText, TrendingUp, 
  AlertCircle, RefreshCw, Eye, ExternalLink, Sparkles,
  Globe, MousePointer, ArrowUpRight, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

interface AnalyticsData {
  month: string;
  visits: number;
  pageviews?: number;
  visitors?: number;
  avg_session_duration: number;
  pages_per_visit: number;
}

interface AnalyticsResponse {
  data: AnalyticsData[];
  source: string;
  lastUpdated: string;
  note?: string;
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/analytics');
        const result: AnalyticsResponse = await res.json();
        setData(result.data);
        setLastUpdated(new Date(result.lastUpdated));
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalytics();
  }, []);

  const totalVisits = data.reduce((sum, d) => sum + d.visits, 0);
  const totalPageviews = data.reduce((sum, d) => sum + (d.pageviews || d.visits * 3), 0);
  const avgDuration = data.length > 0 
    ? data.reduce((sum, d) => sum + d.avg_session_duration, 0) / data.length 
    : 0;
  const avgPagesPerVisit = data.length > 0
    ? data.reduce((sum, d) => sum + d.pages_per_visit, 0) / data.length
    : 0;
  const latestMonthVisits = data.length > 0 ? data[data.length - 1].visits : 0;
  const previousMonthVisits = data.length > 1 ? data[data.length - 2].visits : 0;
  const growthRate = previousMonthVisits > 0 
    ? ((latestMonthVisits - previousMonthVisits) / previousMonthVisits * 100).toFixed(0)
    : 0;

  const chartData = data.map(d => ({
    month: formatMonth(d.month),
    visits: d.visits,
    pageviews: d.pageviews || d.visits * 3,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              Live Tracking Active
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Public Analytics
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Transparent usage statistics for this project. 
              I believe in openness—see exactly how this tool is being used.
            </p>
            
            {/* Big CTA to Umami Dashboard */}
            <a
              href="https://cloud.umami.is/share/eS8m2CgXLdCzHXy7/Fair%20Price%20Predictor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-2xl hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              <Sparkles className="w-6 h-6" />
              View Live Dashboard
              <ArrowUpRight className="w-5 h-5" />
            </a>
            <p className="text-sm text-blue-200 mt-4">
              Real-time visitor tracking powered by Umami Analytics
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Live Dashboard Card - Prominent */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-indigo-100">Live Tracking</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Real-Time Analytics Dashboard</h2>
              <p className="text-indigo-100">
                Click below to see live visitor data, page views, countries, devices, and more.
              </p>
            </div>
            <a
              href="https://cloud.umami.is/share/eS8m2CgXLdCzHXy7/Fair%20Price%20Predictor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
            >
              <ExternalLink className="w-5 h-5" />
              Open Live Dashboard
            </a>
          </div>
        </div>

        {/* Why I Share This */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Why I share this publicly
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                I believe in transparency. These analytics show real usage without exposing any personal data—no 
                IPs, no user identifiers, no individual browsing trails. Just aggregate numbers to show this tool 
                is actually being used and helping people.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-4"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Total Visits</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumber(totalVisits)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Last {data.length} months
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <MousePointer className="w-4 h-4" />
                <span className="text-sm font-medium">Page Views</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumber(totalPageviews)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Total interactions
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">This Month</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatNumber(latestMonthVisits)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {Number(growthRate) > 0 ? (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    +{growthRate}% vs last month
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatMonth(data[data.length - 1]?.month || '')}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Avg. Session</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatDuration(avgDuration)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {avgPagesPerVisit.toFixed(1)} pages/visit
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Traffic Over Time
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-slate-600 dark:text-slate-400">Visits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-600 dark:text-slate-400">Page Views</span>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="h-72 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#fff',
                      padding: '12px'
                    }}
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(), 
                      name === 'visits' ? 'Visits' : 'Page Views'
                    ]}
                  />
                  <Area 
                    type="monotone"
                    dataKey="pageviews" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPageviews)"
                  />
                  <Area 
                    type="monotone"
                    dataKey="visits" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVisits)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Secondary CTA */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 text-center">
          <Globe className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
            Want More Details?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            See real-time visitors, geographic distribution, device types, and more on the live dashboard.
          </p>
          <a
            href="https://cloud.umami.is/share/eS8m2CgXLdCzHXy7/Fair%20Price%20Predictor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            View Full Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Summary last updated: {lastUpdated.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <a 
            href="https://cloud.umami.is/share/eS8m2CgXLdCzHXy7/Fair%20Price%20Predictor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View real-time data
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Privacy Note */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Privacy First</p>
              <p>
                These statistics are aggregated and anonymized. I don't track individual users, 
                collect personal information, or store IP addresses. Analytics are collected using 
                Umami—a privacy-friendly, cookie-free analytics solution that respects your browsing experience.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
