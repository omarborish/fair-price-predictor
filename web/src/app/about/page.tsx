'use client';

import Link from 'next/link';
import { 
  Heart, Target, Lightbulb, DollarSign, Lock, 
  Sparkles, MessageSquare, ArrowRight, CheckCircle2,
  Bot, AlertCircle
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            About This Project
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Why I built Fair Price Predictor and what my goals are.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Why I Built This */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Why I Built This
            </h2>
          </div>
          
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              When I was shopping for a used car, I wanted a simple way to check if a price was fair. 
              The tools I found were either behind paywalls, required creating accounts, or felt overly 
              complicated for what should be a straightforward question: <em>"Is this price reasonable?"</em>
            </p>
            <p>
              So I decided to build my own. I had the data science skills, I found a solid dataset, 
              and I wanted a project that would actually be useful to real people—not just a portfolio piece 
              that sits in a GitHub repo.
            </p>
            <p>
              My goal was simple: <strong>make it free, make it easy, and make it honest about what it can 
              and can't do.</strong>
            </p>
          </div>
        </section>

        {/* My Goals */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              My Goals
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Help people make better decisions</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Whether you're buying or selling, having a data-backed estimate helps you negotiate with confidence.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Grow my career in AI/ML</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  I'm pursuing roles in AI and machine learning. This project lets me demonstrate real skills 
                  while creating something genuinely useful.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Keep it accessible</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No subscriptions, no account required, no paywalls. Just a useful tool that works.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes This Different */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              What Makes This Different
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <Lock className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">No Login Required</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Use it immediately, no account needed.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <DollarSign className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Completely Free</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">No subscription, no premium tier.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <Target className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Price Ranges, Not Just Numbers</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Get low, fair, and high estimates.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <MessageSquare className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Honest About Limitations</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">I tell you what the model can't know.</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Ads */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              About the Ads
            </h2>
          </div>
          
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              You might notice ads on this site. I added them for a simple reason: a little side income 
              helps cover hosting costs and motivates me to keep improving the tool.
            </p>
            <p>
              I've tried to keep ads minimal and non-intrusive. The core functionality is completely free 
              and will stay that way. I'm not going to lock features behind a paywall or nag you to subscribe.
            </p>
          </div>
        </section>

        {/* Future Ideas - LLM Chatbot */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Future Ideas: Car Market Chatbot
            </h2>
          </div>
          
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              One idea I've been thinking about is building a fine-tuned chatbot that could answer 
              detailed questions about car specs, reliability, common issues, and market trends. 
              Imagine asking: <em>"What should I look out for when buying a 2018 Honda Civic with 80k miles?"</em>
            </p>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <p className="font-medium text-slate-900 dark:text-white text-sm">Why I haven't added it yet</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>
                    <strong>It would reduce ad views.</strong> If users get answers in a chat, they might not 
                    explore the insights pages where ads help support the site.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>
                    <strong>It deserves its own project.</strong> A properly fine-tuned car knowledge LLM 
                    is a significant undertaking—not something to bolt on as an afterthought.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>
                    <strong>Quality matters.</strong> I'd rather build it right as a standalone project 
                    than add a mediocre chatbot here.
                  </span>
                </li>
              </ul>
            </div>
            
            <p>
              It's still something I want to build eventually. If you're interested or have ideas, 
              feel free to reach out through the{' '}
              <Link href="/community" className="text-green-600 dark:text-green-400 hover:underline">
                community page
              </Link>{' '}
              or{' '}
              <Link href="/feedback" className="text-green-600 dark:text-green-400 hover:underline">
                send feedback
              </Link>.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-white">
          <h2 className="text-xl font-bold mb-4">Ready to Try It?</h2>
          <p className="text-green-100 mb-6">
            Get a fair price estimate for any used car in seconds. Free, no login required.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors"
            >
              Get a Price Estimate
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/model"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
