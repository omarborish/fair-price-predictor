import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client for build time when env vars aren't available
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a mock client that will fail gracefully
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) }),
      eq: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
      order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
    }),
    rpc: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
  } as unknown as SupabaseClient;
}

export { supabase };

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Types for our database tables
export interface Comment {
  id: string;
  created_at: string;
  name: string;
  content: string;
  parent_id: string | null;
  upvotes: number;
  is_hidden: boolean;
}

export interface Feedback {
  id: string;
  created_at: string;
  message: string;
  email: string | null;
  category: 'bug' | 'idea' | 'data_issue' | 'other';
}

export interface AnalyticsSnapshot {
  id: string;
  created_at: string;
  month: string;
  visits: number;
  avg_session_duration: number;
  pages_per_visit: number;
}

// Comment functions
export async function getComments() {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Comment[];
}

export async function createComment(name: string, content: string, parentId?: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        name: name.trim() || 'Anonymous',
        content: content.trim(),
        parent_id: parentId || null,
        upvotes: 0,
        is_hidden: false,
      }
    ])
    .select()
    .single();
  
  if (error) throw error;
  return data as Comment;
}

export async function upvoteComment(id: string) {
  const { error } = await supabase.rpc('increment_upvotes', { comment_id: id });
  if (error) throw error;
}

// Feedback functions
export async function createFeedback(message: string, category: string, email?: string) {
  const { data, error } = await supabase
    .from('feedback')
    .insert([
      {
        message: message.trim(),
        category,
        email: email?.trim() || null,
      }
    ])
    .select()
    .single();
  
  if (error) throw error;
  return data as Feedback;
}

// Analytics functions
export async function getAnalytics() {
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .order('month', { ascending: false })
    .limit(12);
  
  if (error) throw error;
  return data as AnalyticsSnapshot[];
}

export async function getTotalVisits() {
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('visits');
  
  if (error) throw error;
  return data?.reduce((sum, row) => sum + (row.visits || 0), 0) || 0;
}
