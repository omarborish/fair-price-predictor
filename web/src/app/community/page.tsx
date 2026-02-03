'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, ThumbsUp, Clock, User, 
  AlertCircle, Loader2, CheckCircle2
} from 'lucide-react';

interface Comment {
  id: string;
  created_at: string;
  name: string;
  content: string;
  parent_id: string | null;
  upvotes: number;
}

// Sample comments for demonstration
const sampleComments: Comment[] = [
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
];

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
  // Honeypot field for spam protection
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setIsLoading(true);
    // In production, this would fetch from Supabase
    await new Promise(resolve => setTimeout(resolve, 500));
    setComments(sampleComments);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (honeypot) {
      return; // Bot detected
    }
    
    if (!content.trim()) {
      setError('Please enter a message');
      return;
    }
    
    if (content.length < 10) {
      setError('Message must be at least 10 characters');
      return;
    }
    
    if (content.length > 1000) {
      setError('Message must be under 1000 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // In production, this would call Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newComment: Comment = {
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        name: name.trim() || 'Anonymous',
        content: content.trim(),
        parent_id: null,
        upvotes: 0,
      };
      
      setComments([newComment, ...comments]);
      setName('');
      setContent('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (id: string) => {
    // In production, this would call Supabase
    setComments(comments.map(c => 
      c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c
    ));
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

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
          ) : sortedComments.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No comments yet. Be the first to share your experience!
              </p>
            </div>
          ) : (
            sortedComments.map(comment => (
              <div 
                key={comment.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
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
                
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  {comment.content}
                </p>
                
                <button
                  onClick={() => handleUpvote(comment.id)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {comment.upvotes}
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
