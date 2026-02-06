import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { withCors, corsPreflight } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

/**
 * Verify admin authentication
 */
function verifyAdmin(request: NextRequest): boolean {
  try {
    const authHeader = request.headers.get('Authorization');
    const adminSecret = process.env.ADMIN_SECRET_KEY;
    
    if (!authHeader || !adminSecret) {
      return false;
    }
    
    const token = authHeader.replace('Bearer ', '');
    return token === adminSecret;
  } catch (error) {
    console.error('Auth verification error:', error);
    return false;
  }
}

/**
 * GET /api/admin/comments
 * Get all comments (including hidden) for moderation
 */
export async function GET(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return withCors(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    // If Supabase isn't configured, return sample data for admin testing
    if (!isSupabaseConfigured()) {
      return withCors(request, NextResponse.json({ 
        comments: [
          {
            id: 'sample-1',
            created_at: new Date().toISOString(),
            name: 'Test User',
            content: 'This is a sample comment for admin testing. Supabase is not configured.',
            upvotes: 5,
            is_hidden: false,
          }
        ],
        note: 'Supabase not configured - showing sample data'
      }));
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return withCors(request, NextResponse.json({ error: error.message }, { status: 500 }));
    }

    return withCors(request, NextResponse.json({ comments: data || [] }));
  } catch (error) {
    console.error('Admin comments GET error:', error);
    return withCors(request, NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 }));
  }
}

/**
 * PATCH /api/admin/comments
 * Update comment (hide/unhide)
 */
export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return withCors(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  try {
    const body = await request.json();
    const { id, is_hidden } = body;

    if (!id || typeof is_hidden !== 'boolean') {
      return withCors(request, NextResponse.json({ error: 'Invalid request body' }, { status: 400 }));
    }

    const { data, error } = await supabase
      .from('comments')
      .update({ is_hidden })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return withCors(request, NextResponse.json({ error: error.message }, { status: 500 }));
    }

    return withCors(request, NextResponse.json({ comment: data, message: is_hidden ? 'Comment hidden' : 'Comment visible' }));
  } catch (error) {
    return withCors(request, NextResponse.json({ error: 'Failed to update comment' }, { status: 500 }));
  }
}

/**
 * DELETE /api/admin/comments
 * Permanently delete a comment
 */
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return withCors(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return withCors(request, NextResponse.json({ error: 'Comment ID required' }, { status: 400 }));
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      return withCors(request, NextResponse.json({ error: error.message }, { status: 500 }));
    }

    return withCors(request, NextResponse.json({ message: 'Comment deleted' }));
  } catch (error) {
    return withCors(request, NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 }));
  }
}
