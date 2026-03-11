import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingCart, ArrowRight, Search, FileText, Wrench, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'The Complete Guide to Buying a Used Car | Fair Price Predictor',
  description: 'A practical, step-by-step guide to buying a used car — from setting a budget and researching models to inspections, negotiation, and closing the deal.',
  openGraph: {
    title: 'The Complete Guide to Buying a Used Car',
    description: 'Everything you need to know before, during, and after buying a used vehicle.',
  },
};

export default function BuyingGuide() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
            <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
            <span>/</span>
            <span>Buying a Used Car</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            The Complete Guide to Buying a Used Car
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl">
            Buying a used car is one of the best financial decisions you can make — if you
            do it right. This guide walks you through the entire process, from research
            to closing the deal, so you can buy with confidence.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* 1. Budget */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            1. Set a Realistic Budget
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Before you start browsing listings, decide how much you can actually afford. Your
            budget is not just the sticker price — it includes taxes, registration, insurance,
            and the cost of any immediate repairs or maintenance the car might need.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            A common guideline is that your total car expenses (payment, insurance, fuel,
            maintenance) should not exceed 15–20% of your take-home pay. If you are paying
            cash, you avoid interest charges entirely, which is the simplest way to keep
            costs predictable.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            If financing, get pre-approved by your bank or credit union before visiting a
            dealer. Dealer financing is convenient but often comes at a higher interest rate.
            Having a pre-approval in hand gives you leverage and a clear ceiling on what
            you will pay.
          </p>
        </section>

        {/* 2. Research */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              2. Research Models and Fair Prices
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Start broad. If you know you need a midsize sedan, look at three or four models —
            the Honda Accord, Toyota Camry, Mazda6, and Hyundai Sonata are common choices, but
            do not rule out less popular models that might offer better value for the same
            money. Vehicles that depreciate faster (luxury brands, some domestic models) can
            be excellent buys used because you get more car for less money.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Use pricing tools to establish a baseline. Our{' '}
            <Link href="/" className="text-green-600 dark:text-green-400 hover:underline">
              price predictor
            </Link>{' '}
            gives you an instant estimate based on real market data. Cross-reference with
            Kelley Blue Book or Edmunds for a second data point. The overlap between multiple
            sources gives you the most reliable sense of fair market value.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Check reliability ratings from Consumer Reports or J.D. Power. A car that is
            $2,000 cheaper but has a history of expensive transmission failures is not
            actually a good deal. Total cost of ownership — including expected repairs,
            fuel, and insurance — matters more than the purchase price alone.
          </p>
        </section>

        {/* 3. Where to Buy */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            3. Where to Buy: Dealer vs. Private Seller vs. Online
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Franchise Dealers</h3>
              <p>
                Offer certified pre-owned programs, financing, and trade-in options. You pay
                a premium for the convenience and consumer protections, but you also get
                recourse if something goes wrong shortly after purchase.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Independent Dealers</h3>
              <p>
                Smaller lots with lower overhead. Prices may be competitive, but the quality
                of reconditioning varies widely. Ask about any warranty and get everything
                in writing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Private Sellers</h3>
              <p>
                Typically the lowest prices because there is no dealer margin. However, you
                take on more risk: no warranty, limited legal protections, and you need to
                handle paperwork yourself. Private sales are best for buyers who are
                comfortable inspecting cars or who can bring a trusted mechanic.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Online Platforms (Carvana, Vroom, etc.)</h3>
              <p>
                Convenient and often offer return policies. Pricing tends to be competitive
                with dealer retail, but you cannot inspect the car in person before buying.
                Read the return policy carefully and plan to have the car inspected by a
                local mechanic immediately after delivery.
              </p>
            </div>
          </div>
        </section>

        {/* 4. History Report */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              4. Pull a Vehicle History Report
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Before you visit a car in person, run the VIN through Carfax or AutoCheck. A
            history report reveals accidents, title issues (salvage, flood, lemon buyback),
            odometer rollbacks, service records, and the number of previous owners.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Not all accidents are deal-breakers. A minor fender bender with professional
            repairs is very different from a major collision that damaged the frame. What
            matters is the severity of the damage and the quality of the repair.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            A clean history report does not guarantee a problem-free car — some damage goes
            unreported — but a bad report is a strong red flag. If the seller will not
            provide the VIN or discourages you from running a report, walk away.
          </p>
        </section>

        {/* 5. Inspection */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              5. Get a Pre-Purchase Inspection
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            This is the single most important step most buyers skip. A pre-purchase
            inspection (PPI) by an independent mechanic typically costs $100–$200 and can
            save you thousands by catching problems the seller might not disclose — or
            might not even know about.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            A good PPI covers the engine, transmission, brakes, suspension, tires,
            electrical system, and a test drive. The mechanic will also check for signs of
            accident repair: misaligned body panels, overspray, and welding marks that
            suggest frame damage.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            If a seller refuses to let you have the car inspected by your own mechanic,
            that is a serious red flag. Any honest seller with a good car has nothing to
            hide from an independent inspection.
          </p>
        </section>

        {/* 6. Test Drive */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            6. The Test Drive
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            A proper test drive is at least 20–30 minutes and should include city streets,
            highway speeds, and parking maneuvers. Pay attention to:
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400 mb-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>How the engine sounds cold vs. warm — unusual noises can indicate problems</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>Transmission shifts — they should be smooth with no hesitation or clunking</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>Steering alignment — the car should track straight without pulling</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>Brake feel — firm pedal, no vibration, no grinding sounds</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span>All electronics — A/C, heater, windows, infotainment, lights, and power seats</span>
            </li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">
            Start the car from cold if possible. Many issues — like rough idle, exhaust
            smoke, and transmission slippage — are most noticeable when the engine has not
            been warmed up. If the seller has the car running when you arrive, ask them to
            shut it off and let it sit for a few minutes before restarting.
          </p>
        </section>

        {/* 7. Negotiation */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              7. How to Negotiate
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Come prepared with data. Show the seller what comparable vehicles are listed for
            and what pricing tools estimate the car is worth. Concrete numbers make your
            offer feel reasonable rather than arbitrary.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Use anything the inspection or history report revealed as leverage — not to be
            adversarial, but to justify a fair adjustment. If the PPI finds the brakes need
            replacing ($400–$800 in parts and labor), it is reasonable to deduct that from
            your offer.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Be willing to walk away. This is the most powerful negotiating tool you have.
            If the price is not right, thank the seller and leave. More often than not, you
            will get a call or text with a lower number within a day or two. There is always
            another car.
          </p>
        </section>

        {/* 8. Title Types */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              8. Understanding Title Types
            </h2>
          </div>
          <div className="space-y-3 text-slate-600 dark:text-slate-400">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Clean title</h3>
              <p>The vehicle has never been declared a total loss. This is what you want in most cases.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Salvage title</h3>
              <p>An insurance company declared the vehicle a total loss due to damage, theft recovery, or flood. Salvage-title cars can be significantly cheaper, but they are harder to insure, harder to resell, and may have hidden structural issues.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Rebuilt title</h3>
              <p>A salvage vehicle that has been repaired and passed a state inspection. It is legal to drive and insure, but it will always carry a value discount compared to a clean-title equivalent.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Lemon title</h3>
              <p>The original owner successfully claimed the car was defective under lemon law. This is a strong warning sign about recurring mechanical problems.</p>
            </div>
          </div>
        </section>

        {/* 9. Closing */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            9. Closing the Deal
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Once you have agreed on a price, read every document before signing. At a
            dealership, watch out for add-ons in the finance office: extended warranties,
            paint protection, gap insurance, and service plans. Some of these are worthwhile;
            many are overpriced. You can usually buy them cheaper from third-party providers.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            For a private sale, ensure you receive a signed title, a bill of sale, and
            any service records. Check that the name on the title matches the seller&apos;s
            ID. Handle payment securely — a cashier&apos;s check or bank transfer is safer
            than carrying large amounts of cash. Register the car in your name promptly
            and arrange insurance before driving it home.
          </p>
        </section>

        {/* Related guides */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Related Guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/how-used-car-pricing-works"
              className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">How Used Car Pricing Works</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 ml-auto transition-colors" />
            </Link>
            <Link
              href="/what-affects-used-car-value"
              className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">What Affects Used Car Value</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 ml-auto transition-colors" />
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Check fair prices before you buy <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
