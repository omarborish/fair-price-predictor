'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, ThumbsUp, Clock, User, 
  AlertCircle, Loader2, CheckCircle2, ImagePlus
} from 'lucide-react';
import Image from 'next/image';

interface Comment {
  id: string;
  created_at: string;
  name: string;
  content: string;
  parent_id: string | null;
  upvotes: number;
  avatar_url?: string;
}

// Generate a random avatar URL based on a seed (name or ID)
function getAvatarUrl(seed: string): string {
  // Using DiceBear API for random avatars - free and no API key needed
  const styles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'micah', 'miniavs', 'personas'];
  const style = styles[Math.abs(hashCode(seed)) % styles.length];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

// Simple hash function for consistent avatar per user
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Get upvoted comment IDs from localStorage
function getUpvotedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem('upvoted_comments');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

// Save upvoted comment ID to localStorage
function saveUpvotedId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const upvoted = getUpvotedIds();
    upvoted.add(id);
    localStorage.setItem('upvoted_comments', JSON.stringify(Array.from(upvoted)));
  } catch {
    // Ignore localStorage errors
  }
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default function CommunityPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes'>('newest');
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  // Honeypot field for spam protection
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    loadComments();
    setUpvotedIds(getUpvotedIds());
  }, []);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/comments');
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      } else {
        // If API fails, show empty state
        setComments([]);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitComment = async (message: string, parentId?: string | null) => {
    const trimmed = message.trim();

    if (!trimmed) {
      throw new Error('Please enter a message');
    }
    
    if (trimmed.length < 10) {
      throw new Error('Message must be at least 10 characters');
    }
    
    if (trimmed.length > 1000) {
      throw new Error('Message must be under 1000 characters');
    }

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim() || 'Anonymous',
        content: trimmed,
        parent_id: parentId || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to post comment');
    }

    const data = await res.json();
    setComments(prev => [data.comment, ...prev]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (honeypot) {
      return; // Bot detected
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitComment(content, null);
      setName('');
      setContent('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();

    setIsSubmitting(true);
    setReplyError(null);

    try {
      await submitComment(replyContent, parentId);
      setReplyContent('');
      setReplyToId(null);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Failed to post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (id: string) => {
    // Check if already upvoted
    if (upvotedIds.has(id)) {
      return; // Already upvoted
    }

    // Optimistic update
    setComments(comments.map(c => 
      c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c
    ));
    
    // Save to localStorage
    saveUpvotedId(id);
    setUpvotedIds(new Set([...Array.from(upvotedIds), id]));

    // Call API
    try {
      await fetch('/api/comments/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      // Revert on error
      setComments(comments.map(c => 
        c.id === id ? { ...c, upvotes: c.upvotes - 1 } : c
      ));
      console.error('Failed to upvote:', err);
    }
  };

  const topLevelComments = comments.filter(comment => !comment.parent_id);
  const repliesByParent = comments.reduce<Record<string, Comment[]>>((acc, comment) => {
    if (comment.parent_id) {
      if (!acc[comment.parent_id]) {
        acc[comment.parent_id] = [];
      }
      acc[comment.parent_id].push(comment);
    }
    return acc;
  }, {});

  Object.values(repliesByParent).forEach(list => {
    list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  });

  const sortedTopLevel = [...topLevelComments].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const renderComment = (comment: Comment, depth: number) => {
    const hasUpvoted = upvotedIds.has(comment.id);
    const avatarUrl = comment.avatar_url || getAvatarUrl(comment.name + comment.id);
    const replies = repliesByParent[comment.id] || [];

    return (
      <div key={comment.id} style={{ marginLeft: depth * 24 }}>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
              <img 
                src={avatarUrl}
                alt={`${comment.name}'s avatar`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to User icon if avatar fails
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                  const icon = document.createElement('div');
                  icon.innerHTML = '<svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                  e.currentTarget.parentElement!.appendChild(icon);
                }}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-white">
                {comment.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(comment.created_at)}
              </div>
            </div>
          </div>
          
          <p className="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">
            {comment.content}
          </p>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleUpvote(comment.id)}
              disabled={hasUpvoted}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                hasUpvoted 
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 cursor-default'
                  : 'text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
              title={hasUpvoted ? 'You already upvoted this' : 'Upvote this comment'}
            >
              <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
              {comment.upvotes}
            </button>
            <button
              onClick={() => {
                setReplyToId(comment.id);
                setReplyContent('');
                setReplyError(null);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Reply
            </button>
          </div>
        </div>

        {replyToId === comment.id && (
          <form
            onSubmit={(e) => handleReplySubmit(e, comment.id)}
            className="mt-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
            />
            {replyError && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                {replyError}
              </div>
            )}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Reply
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyToId(null);
                  setReplyContent('');
                  setReplyError(null);
                }}
                className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Community
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Questions, feedback, and discussions
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Post Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Share Your Experience or Ask a Question
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field - hidden from real users */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name (optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anonymous"
                maxLength={50}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Your Message
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience, ask a question, or suggest an improvement..."
                rows={4}
                maxLength={1000}
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
                {content.length}/1000
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {submitSuccess && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Your comment has been posted!
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post Comment
                </>
              )}
            </button>
          </form>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            No login required. Please be respectful and constructive. Spam and inappropriate content will be removed.
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">Sort by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                sortBy === 'newest'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('upvotes')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                sortBy === 'upvotes'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Most Upvoted
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </>
          ) : sortedTopLevel.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No comments yet. Be the first to share your experience!
              </p>
            </div>
          ) : (
            sortedTopLevel.map(comment => renderComment(comment, 0))
          )}
        </div>

      </div>
    </div>
  );
}
