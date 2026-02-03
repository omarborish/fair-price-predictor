import Link from 'next/link';
import { Car, Github, Mail, Linkedin, Facebook, Instagram } from 'lucide-react';

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
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
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
                Our AI analyzes millions of listings to help you make informed buying and selling decisions.
              </p>
              
              {/* Built By */}
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Built by</span>
                <Link 
                  href="/contact" 
                  className="font-semibold text-green-600 dark:text-green-400 hover:underline"
                >
                  Engineer Omar Borish
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
                  <Link href="/insights" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Market Insights
                  </Link>
                </li>
                <li>
                  <Link href="/methodology" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Contact / Credits
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy#terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy#cookies" className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    Cookie Policy
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
                <Link href="/contact" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                  Engineer Omar Borish
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
              <a
                href="mailto:omarborish2004@gmail.com"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
