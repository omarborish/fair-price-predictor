import { 
  Mail, Phone, Github, Linkedin, Facebook, Instagram,
  ExternalLink, Database, User, Heart
} from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';
import Link from 'next/link';

const socialLinks = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/omar-borish-9a75a1249/',
    icon: Linkedin,
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    name: 'GitHub',
    url: 'https://github.com/omarborish',
    icon: Github,
    color: 'bg-gray-800 hover:bg-gray-900'
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/omar.khalid.borish',
    icon: Facebook,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/omarborish/',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
  },
];

const profileLinks = [
  {
    name: 'Hugging Face',
    url: 'https://huggingface.co/omarborish2004',
    description: 'ML Models & Datasets'
  },
  {
    name: 'Indeed',
    url: 'https://profile.indeed.com/p/omarb-nn01f6d',
    description: 'Professional Profile'
  },
  {
    name: 'Handshake',
    url: 'https://app.joinhandshake.com/profiles/w4t79h',
    description: 'Career Profile'
  },
];

const emails = [
  'omarborish2004@gmail.com',
  'omarborish2004@yahoo.com',
  'okborish@uab.edu',
  'omar.1800653.ai22@fcai.usc.edu.eg',
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <User className="w-4 h-4" />
              About the Developer
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Built by Engineer Omar Borish
            </h1>
            <p className="text-lg text-indigo-100">
              Full-stack developer & ML engineer passionate about building 
              data-driven applications that solve real-world problems.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Ad */}
        <AdSlot position="header" className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            {/* Social Links */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Connect With Me
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium transition-all ${link.color}`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Email Contact */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Email Addresses
              </h2>
              <div className="space-y-3">
                {emails.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {email}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500" />
                Phone
              </h2>
              <a
                href="tel:+16592409190"
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-slate-700 dark:text-slate-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors text-lg font-medium">
                  +1 (659) 240-9190
                </span>
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Professional Profiles */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-purple-500" />
                Professional Profiles
              </h2>
              <div className="space-y-3">
                {profileLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {link.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {link.description}
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Dataset Attribution */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-500" />
                Dataset Attribution
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                This project uses the Craigslist Cars and Trucks dataset, which contains 
                hundreds of thousands of used vehicle listings from across the United States.
              </p>
              <a
                href="https://www.kaggle.com/datasets/austinreese/craigslist-carstrucks-data"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
              >
                <Database className="w-5 h-5" />
                View Dataset on Kaggle
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                Dataset by Austin Reese • Used under Kaggle's terms of service
              </p>
            </div>

            {/* About This Project */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                About This Project
              </h2>
              <div className="prose prose-slate dark:prose-invert text-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  Fair Price Predictor is a machine learning-powered web application that 
                  helps users estimate fair market values for used cars. The model is trained 
                  on real listing data and uses gradient boosting techniques for accurate predictions.
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-3">
                  <strong>Tech Stack:</strong> Next.js, FastAPI, scikit-learn, TailwindCSS, Recharts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* In-content Ad */}
        <AdSlot position="in-content" className="mt-8" />
      </div>
    </div>
  );
}
