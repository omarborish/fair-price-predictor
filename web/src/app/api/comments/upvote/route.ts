import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { withCors, corsPreflight } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

// POST - Upvote a comment
export async function POST(request: NextRequest) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    // Just return success for sample data (upvotes won't persist)
    return withCors(request, NextResponse.json({ success: true, message: 'Upvote recorded locally' }));
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return withCors(request, NextResponse.json({ error: 'Comment ID is required' }, { status: 400 }));
    }

    // Try to use the RPC function if available, otherwise do direct update
    const { error: rpcError } = await supabase.rpc('increment_upvotes', { comment_id: id });
    
    if (rpcError) {
      // Fallback: direct update if RPC doesn't exist
      const { data: current, error: fetchError } = await supabase
        .from('comments')
        .select('upvotes')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching comment:', fetchError);
        return withCors(request, NextResponse.json({ error: 'Comment not found' }, { status: 404 }));
      }

      const { error: updateError } = await supabase
        .from('comments')
        .update({ upvotes: (current?.upvotes || 0) + 1 })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating upvotes:', updateError);
        return withCors(request, NextResponse.json({ error: 'Failed to upvote' }, { status: 500 }));
      }
    }

    return withCors(request, NextResponse.json({ success: true }));
  } catch (err) {
    console.error('Error upvoting comment:', err);
    return withCors(request, NextResponse.json({ error: 'Failed to upvote' }, { status: 500 }));
  }
}
