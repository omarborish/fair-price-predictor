import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { withCors, corsPreflight } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

// GET - Fetch all visible comments
export async function GET(request: NextRequest) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    // Return sample comments if Supabase isn't set up
    const res = NextResponse.json({
      comments: [
        {
          id: '1',
          created_at: '2026-01-28T14:30:00Z',
          name: 'CarBuyer2026',
          content: 'Used this to check a 2019 Camry I was looking at. The price range was spot on with what the dealer was asking. Helped me feel confident about the deal!',
          parent_id: null,
          upvotes: 12,
        },
        {
          id: '2',
          created_at: '2026-01-26T09:15:00Z',
          name: 'Anonymous',
          content: 'Would be great to see Canadian market data too. Currently it seems US-focused. Still useful for ballpark estimates though.',
          parent_id: null,
          upvotes: 8,
        },
        {
          id: '3',
          created_at: '2026-01-24T18:45:00Z',
          name: 'FirstTimeSeller',
          content: 'I was about to list my car way too low. This tool showed me the fair range and I ended up getting $2,000 more than I originally planned to ask. Thank you!',
          parent_id: null,
          upvotes: 15,
        },
      ],
      source: 'sample',
    });
    return withCors(request, res);
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return withCors(request, NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 }));
    }

    return withCors(request, NextResponse.json({ comments: data || [], source: 'supabase' }));
  } catch (err) {
    console.error('Error fetching comments:', err);
    return withCors(request, NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 }));
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return withCors(request, NextResponse.json(
      { error: 'Comments are currently unavailable. Please try again later.' },
      { status: 503 }
    ));
  }

  try {
    const body = await request.json();
    const { name, content, parent_id } = body;

    // Validation
    if (!content || typeof content !== 'string') {
      return withCors(request, NextResponse.json({ error: 'Content is required' }, { status: 400 }));
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 10) {
      return withCors(request, NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 }));
    }

    if (trimmedContent.length > 1000) {
      return withCors(request, NextResponse.json({ error: 'Message must be under 1000 characters' }, { status: 400 }));
    }

    const trimmedName = (name || 'Anonymous').trim().slice(0, 50);

    // Insert comment
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          name: trimmedName || 'Anonymous',
          content: trimmedContent,
          parent_id: parent_id || null,
          upvotes: 0,
          is_hidden: false,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return withCors(request, NextResponse.json({ error: 'Failed to create comment' }, { status: 500 }));
    }

    return withCors(request, NextResponse.json({ comment: data, success: true }));
  } catch (err) {
    console.error('Error creating comment:', err);
    return withCors(request, NextResponse.json({ error: 'Failed to create comment' }, { status: 500 }));
  }
}
