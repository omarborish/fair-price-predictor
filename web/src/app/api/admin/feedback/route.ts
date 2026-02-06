import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { withCors, corsPreflight } from '@/lib/cors';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

/**
 * Verify admin authentication
 */
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !ADMIN_SECRET) {
    return false;
  }
  
  const token = authHeader.replace('Bearer ', '');
  return token === ADMIN_SECRET;
}

/**
 * GET /api/admin/feedback
 * Get all feedback submissions for review
 */
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return withCors(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    return withCors(request, NextResponse.json({ error: 'Supabase admin is not configured' }, { status: 500 }));
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return withCors(request, NextResponse.json({ error: error.message }, { status: 500 }));
    }

    return withCors(request, NextResponse.json({ feedback: data }));
  } catch (error) {
    return withCors(request, NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 }));
  }
}

/**
 * DELETE /api/admin/feedback
 * Delete a feedback submission
 */
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return withCors(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
    return withCors(request, NextResponse.json({ error: 'Supabase admin is not configured' }, { status: 500 }));
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return withCors(request, NextResponse.json({ error: 'Feedback ID required' }, { status: 400 }));
    }

    const { error } = await supabaseAdmin
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) {
      return withCors(request, NextResponse.json({ error: error.message }, { status: 500 }));
    }

    return withCors(request, NextResponse.json({ message: 'Feedback deleted' }));
  } catch (error) {
    return withCors(request, NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 }));
  }
}
