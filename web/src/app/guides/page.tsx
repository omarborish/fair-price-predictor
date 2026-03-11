import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { DollarSign, ShoppingCart, BarChart3, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Used Car Guides & Resources | Fair Price Predictor',
  description: 'Free guides on used car pricing, buying tips, and understanding what affects vehicle value. Learn how to get the best deal on your next used car.',
  openGraph: {
    title: 'Used Car Guides & Resources',
    description: 'In-depth guides on used car pricing, buying strategies, and vehicle value factors.',
  },
};

const guides = [
  {
    href: '/how-used-car-pricing-works',
    title: 'How Used Car Pricing Works',
    description: 'Understand how dealers, private sellers, and online tools determine what a used car is worth. Learn about wholesale auctions, market dynamics, and why prices vary so much.',
    icon: DollarSign,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    readTime: '8 min read',
  },
  {
    href: '/buying-a-used-car-guide',
    title: 'The Complete Guide to Buying a Used Car',
    description: 'A step-by-step walkthrough from setting a budget to closing the deal. Covers vehicle history reports, inspections, negotiation, title types, and common pitfalls.',
    icon: ShoppingCart,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    readTime: '12 min read',
  },
  {
    href: '/what-affects-used-car-value',
    title: 'What Affects Used Car Value',
    description: 'A detailed breakdown of every factor that raises or lowers a used car\'s market price — from mileage and condition to color, regional demand, and accident history.',
    icon: BarChart3,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    readTime: '10 min read',
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <section className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Image src="/assets/logo-mark.svg" alt="" width={40} height={40} className="rounded-xl flex-shrink-0" />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Used Car Guides
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Whether you are buying your first car or comparing prices on a trade-in, these
            guides cover the fundamentals of used car pricing, buying strategies, and what
            actually drives a vehicle&apos;s market value.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 p-6 sm:p-8 transition-colors"
            >
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${guide.color}`}>
                  <guide.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {guide.title}
                    </h2>
                    <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {guide.readTime}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {guide.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-green-500 flex-shrink-0 mt-1 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            More Resources
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Beyond these guides, Fair Price Predictor offers data-driven market analysis
            and a free pricing tool to help you make confident decisions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
              Try the Price Predictor
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/insights" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              Market Insights
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/methodology" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              How the Model Works
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
