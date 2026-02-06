import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { withCors, corsPreflight } from '@/lib/cors';

const VALID_CATEGORIES = new Set(['bug', 'idea', 'data_issue', 'other']);

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

/**
 * POST /api/feedback
 * Submit private feedback
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() && !isSupabaseAdminConfigured()) {
    return withCors(request, NextResponse.json(
      { error: 'Feedback is currently unavailable. Please try again later.' },
      { status: 503 }
    ));
  }

  try {
    const body = await request.json();
    const { message, category, email } = body;

    if (!message || typeof message !== 'string') {
      return withCors(request, NextResponse.json({ error: 'Message is required' }, { status: 400 }));
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 20) {
      return withCors(request, NextResponse.json({ error: 'Please provide more detail (at least 20 characters)' }, { status: 400 }));
    }

    if (trimmedMessage.length > 2000) {
      return withCors(request, NextResponse.json({ error: 'Message must be under 2000 characters' }, { status: 400 }));
    }

    const categoryValue = typeof category === 'string' ? category : 'other';
    if (!VALID_CATEGORIES.has(categoryValue)) {
      return withCors(request, NextResponse.json({ error: 'Invalid category' }, { status: 400 }));
    }

    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    if (trimmedEmail && !trimmedEmail.includes('@')) {
      return withCors(request, NextResponse.json({ error: 'Invalid email address' }, { status: 400 }));
    }

    const client = isSupabaseAdminConfigured() && supabaseAdmin ? supabaseAdmin : supabase;
    const { data, error } = await client
      .from('feedback')
      .insert([
        {
          message: trimmedMessage,
          category: categoryValue,
          email: trimmedEmail || null,
        }
      ])
      .select()
      .single();

    if (error) {
      return withCors(request, NextResponse.json({ error: error.message }, { status: 500 }));
    }

    return withCors(request, NextResponse.json({ feedback: data, success: true }));
  } catch (error) {
    return withCors(request, NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 }));
  }
}
