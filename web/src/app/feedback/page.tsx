'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Send, MessageSquare, Bug, Lightbulb, Database, 
  HelpCircle, AlertCircle, CheckCircle2, Loader2,
  ArrowLeft
} from 'lucide-react';

const categories = [
  { value: 'bug', label: 'Bug Report', icon: Bug, description: 'Something isn\'t working right' },
  { value: 'idea', label: 'Feature Idea', icon: Lightbulb, description: 'Suggest an improvement' },
  { value: 'data_issue', label: 'Data Issue', icon: Database, description: 'Prediction seems off' },
  { value: 'other', label: 'Other', icon: HelpCircle, description: 'General feedback' },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState('other');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Honeypot field for spam protection
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (honeypot) {
      return; // Bot detected
    }
    
    if (!message.trim()) {
      setError('Please enter your feedback');
      return;
    }
    
    if (message.length < 20) {
      setError('Please provide more detail (at least 20 characters)');
      return;
    }

    if (email && !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          category,
          email: email.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Thank You!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your feedback has been received. I read every submission and it genuinely helps me 
            improve this tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Back to Predictor
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setMessage('');
                setCategory('other');
                setEmail('');
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Send More Feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Price Predictor
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Private Feedback
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Send me feedback directly
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This feedback goes directly to me—it won't be posted publicly. 
            Use this for bug reports, data issues, or suggestions you'd prefer to share privately.
            For public discussions, visit the{' '}
            <Link href="/community" className="font-medium underline">
              community page
            </Link>.
          </p>
        </div>

        {/* Feedback Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field - hidden from real users */}
            <input
              type="text"
              name="company"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                What kind of feedback is this?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        category === cat.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${
                        category === cat.value 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-slate-400'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          category === cat.value 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {cat.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Your Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  category === 'bug' 
                    ? 'Please describe what happened and what you expected...'
                    : category === 'idea'
                    ? 'Describe your feature idea and how it would help...'
                    : category === 'data_issue'
                    ? 'Describe the prediction issue (include car details if possible)...'
                    : 'Share your thoughts...'
                }
                rows={6}
                required
                maxLength={2000}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
                {message.length}/2000
              </p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Only if you'd like a response. I won't share it or add you to any list.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
