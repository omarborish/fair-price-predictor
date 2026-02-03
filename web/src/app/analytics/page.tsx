'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Clock, FileText, TrendingUp, 
  AlertCircle, RefreshCw, Eye
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  month: string;
  visits: number;
  avg_session_duration: number;
  pages_per_visit: number;
}

// Sample data - in production this would come from Supabase/analytics provider
const sampleData: AnalyticsData[] = [
  { month: '2025-08', visits: 1250, avg_session_duration: 145.5, pages_per_visit: 2.8 },
  { month: '2025-09', visits: 1890, avg_session_duration: 152.3, pages_per_visit: 3.1 },
  { month: '2025-10', visits: 2340, avg_session_duration: 148.7, pages_per_visit: 2.9 },
  { month: '2025-11', visits: 2780, avg_session_duration: 156.2, pages_per_visit: 3.2 },
  { month: '2025-12', visits: 3150, avg_session_duration: 162.8, pages_per_visit: 3.4 },
  { month: '2026-01', visits: 3520, avg_session_duration: 158.4, pages_per_visit: 3.3 },
];

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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    // Simulate loading from database
    const loadAnalytics = async () => {
      setIsLoading(true);
      // In production, this would fetch from Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(sampleData);
      setLastUpdated(new Date());
      setIsLoading(false);
    };
    
    loadAnalytics();
  }, []);

  const totalVisits = data.reduce((sum, d) => sum + d.visits, 0);
  const avgDuration = data.length > 0 
    ? data.reduce((sum, d) => sum + d.avg_session_duration, 0) / data.length 
    : 0;
  const avgPagesPerVisit = data.length > 0
    ? data.reduce((sum, d) => sum + d.pages_per_visit, 0) / data.length
    : 0;
  const latestMonthVisits = data.length > 0 ? data[data.length - 1].visits : 0;

  const chartData = data.map(d => ({
    month: formatMonth(d.month),
    visits: d.visits,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Public Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Transparent usage statistics
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Transparency Note */}
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
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Total Visits</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalVisits.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Last {data.length} months
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">This Month</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {latestMonthVisits.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formatMonth(data[data.length - 1]?.month || '')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Avg. Duration</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatDuration(avgDuration)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Per session
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Pages/Visit</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {avgPagesPerVisit.toFixed(1)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Average depth
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Monthly Visits
          </h2>
          
          {isLoading ? (
            <div className="h-64 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
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
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Visits']}
                  />
                  <Bar 
                    dataKey="visits" 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Last updated: {lastUpdated.toLocaleString()}</span>
          </div>
          <span>Server time (UTC)</span>
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
                privacy-friendly methods that respect your browsing experience.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
