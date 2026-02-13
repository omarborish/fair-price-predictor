import type { Metadata } from 'next';
import { Shield, Lock, Cookie, Mail, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Fair Price Used Car Predictor',
  description: 'Read our Privacy Policy, Cookie Policy, and Terms of Service. We do not store personal information — vehicle details are processed in real-time only.',
  openGraph: {
    title: 'Privacy Policy — Fair Price Predictor',
    description: 'How we handle your data: no accounts, no stored personal info, transparent cookie and ad policies.',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-700 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Legal Information
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-300">
              Your privacy matters. Here's how we handle your information.
            </p>
            <p className="text-sm text-slate-400 mt-4">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">
                Our Commitment to Privacy
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Fair Price Predictor ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard information when you 
              use our website and services.
            </p>
          </section>

          {/* Data Collection */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">
                Information We Collect
              </h2>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 mb-6">
              <p className="text-green-800 dark:text-green-200 font-medium m-0">
                We do not store any personal information. Vehicle details you enter are processed 
                in real-time and are not saved to any database.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Information You Provide
            </h3>
            <ul className="text-slate-600 dark:text-slate-400">
              <li>Vehicle details (year, make, model, mileage) - processed in real-time only</li>
              <li>No account creation required</li>
              <li>No personal contact information collected</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Automatically Collected Information
            </h3>
            <ul className="text-slate-600 dark:text-slate-400">
              <li>Browser type and version</li>
              <li>Device type</li>
              <li>Pages visited and time spent</li>
              <li>Referral source</li>
              <li>IP address (anonymized for analytics)</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-12" id="cookies">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Cookie className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">
                Cookie Policy
              </h2>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400">
              We use cookies and similar technologies to enhance your experience and for analytics purposes.
            </p>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Types of Cookies We Use
            </h3>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Essential Cookies</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 m-0">
                  Required for the website to function properly. These cannot be disabled.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Analytics Cookies</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 m-0">
                  Help us understand how visitors interact with our website. Data is anonymized.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Advertising Cookies</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 m-0">
                  Used by our advertising partners to show relevant ads. You can opt out of these.
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Managing Cookies
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              You can control cookies through your browser settings. Note that disabling certain 
              cookies may affect website functionality. You can also use our cookie consent banner 
              to manage your preferences.
            </p>
          </section>

          {/* Advertising */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Advertising
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              We display advertisements through third-party advertising networks, including Google AdSense. 
              These networks may use cookies to serve ads based on your prior visits to our website or 
              other websites.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              You can opt out of personalized advertising by visiting:
            </p>
            <ul className="text-slate-600 dark:text-slate-400">
              <li>
                <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Google Ads Settings
                </a>
              </li>
              <li>
                <a href="https://optout.aboutads.info/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Digital Advertising Alliance
                </a>
              </li>
            </ul>
          </section>

          {/* Terms */}
          <section className="mb-12" id="terms">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Terms of Service
            </h2>
            
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Use of Service
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Fair Price Predictor provides estimated market values for used vehicles. These estimates 
              are for informational purposes only and should not be considered as professional appraisals 
              or financial advice.
            </p>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Disclaimer
            </h3>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 dark:text-amber-200 text-sm m-0">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE 
                  THE ACCURACY OF PRICE ESTIMATES. ACTUAL MARKET PRICES MAY VARY SIGNIFICANTLY BASED 
                  ON NUMEROUS FACTORS NOT CAPTURED BY OUR MODEL.
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Limitation of Liability
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              We shall not be liable for any damages arising from your use of or inability to use 
              our service, or from any decision made based on our price estimates.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">
                Contact Us
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              If you have questions about this Privacy Policy or our practices, please contact us at:
            </p>
            <div className="space-y-2">
              <p className="text-slate-600 dark:text-slate-400">
                Visit our <a href="/contact" className="text-blue-600 hover:underline">Contact page</a> for ways to reach us.
              </p>
            </div>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Changes to This Policy
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
