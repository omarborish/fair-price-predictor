import Link from 'next/link';
import Image from 'next/image';
import { Github, Mail, Linkedin, Facebook, Instagram } from 'lucide-react';
import { ObfuscatedEmailLink } from '@/components/ObfuscatedEmailLink';

// Obfuscated so crawlers don't see plain address in HTML (decoded client-side for mailto)
const PRIMARY_EMAIL_ENCODED = 'b21hcmJvcmlzaDIwMDRAZ21haWwuY29t';

const socialLinks = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/omar-borish-9a75a1249/',
    icon: Linkedin,
  },
  {
    name: 'GitHub',
    url: 'https://github.com/omarborish',
    icon: Github,
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/omar.khalid.borish',
    icon: Facebook,
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/omarborish/',
    icon: Instagram,
  },
];

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/assets/logo-mark.svg" alt="" width={40} height={40} className="rounded-xl flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Fair Price Predictor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Used Car Price Estimator
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                Get accurate, data-driven fair market price estimates for any used car. 
                I built this tool to help people make informed buying and selling decisions.
              </p>
              
              {/* Free Tool Badge */}
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-sm text-green-700 dark:text-green-400">
                Free tool — supported by ads
              </div>
              
              {/* Built By */}
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Built by</span>
                <Link 
                  href="/about" 
                  className="font-semibold text-green-600 dark:text-green-400 hover:underline"
                >
                  Omar Borish
                </Link>
              </div>
              
              {/* Disclaimer */}
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Disclaimer:</strong> Price estimates are for informational purposes only and 
                  should not be considered as financial advice. Actual market prices may vary.
                </p>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Price Predictor
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/methodology" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    How It Works &amp; Model
                  </Link>
                </li>
                <li>
                  <Link href="/insights" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Market Insights
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Used Car Guides
                  </Link>
                </li>
              </ul>
            </div>

            {/* Guides & Support */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Guides &amp; Support
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/how-used-car-pricing-works" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    How Pricing Works
                  </Link>
                </li>
                <li>
                  <Link href="/buying-a-used-car-guide" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Buying Guide
                  </Link>
                </li>
                <li>
                  <Link href="/what-affects-used-car-value" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    What Affects Value
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Privacy &amp; Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>&copy; {new Date().getFullYear()} Fair Price Predictor.</span>
              <span className="hidden sm:inline">|</span>
              <span>
                Built by{' '}
                <Link href="/about" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                  Omar Borish
                </Link>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={link.name}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
              <ObfuscatedEmailLink
                encoded={PRIMARY_EMAIL_ENCODED}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                ariaLabel="Email"
              >
                <Mail className="w-5 h-5" />
              </ObfuscatedEmailLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
