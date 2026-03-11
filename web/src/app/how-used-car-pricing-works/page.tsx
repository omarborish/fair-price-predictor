import type { Metadata } from 'next';
import Link from 'next/link';
import { DollarSign, ArrowRight, TrendingUp, MapPin, Calendar, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How Used Car Pricing Works | Fair Price Predictor',
  description: 'Learn how used car prices are determined — from dealer markups and wholesale auctions to online valuation tools. Understand why the same car can be priced differently across sellers.',
  openGraph: {
    title: 'How Used Car Pricing Works',
    description: 'Understand the mechanics behind used car pricing: dealer margins, auctions, market forces, and online tools.',
  },
};

export default function HowUsedCarPricingWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-3">
            <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
            <span>/</span>
            <span>How Used Car Pricing Works</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            How Used Car Pricing Works
          </h1>
          <p className="text-lg text-green-100 max-w-2xl">
            The used car market is one of the largest consumer markets in the country, yet
            most buyers have little insight into how prices are actually set. This guide
            breaks down the mechanics behind used car pricing.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            There Is No Single &ldquo;Correct&rdquo; Price
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Unlike new cars, which have a manufacturer&apos;s suggested retail price (MSRP), used
            cars have no official sticker price. A 2019 Toyota Camry with 45,000 miles might
            be listed at $18,500 by a dealer in Texas and $21,000 by a private seller in
            California. Neither price is necessarily wrong — they reflect different costs,
            different local markets, and different seller motivations.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Understanding this is the first step to making good buying or selling decisions:
            used car prices are a range, not a fixed number. The goal of any pricing tool —
            including ours — is to help you understand where a particular vehicle falls within
            that range so you can negotiate from an informed position.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              How Dealers Price Used Cars
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Dealerships acquire used cars through trade-ins, wholesale auctions, and direct
            purchases. The price you see on a dealer lot includes several layers of cost:
          </p>
          <ul className="space-y-3 text-slate-600 dark:text-slate-400 mb-4">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 min-w-fit">Acquisition cost:</span>
              <span>What the dealer paid at auction or allowed as a trade-in value. Dealers typically aim to acquire vehicles below wholesale book value.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 min-w-fit">Reconditioning:</span>
              <span>Mechanical repairs, detailing, paint touch-ups, new tires, and anything needed to make the car retail-ready. This can range from a few hundred dollars to several thousand.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 min-w-fit">Overhead:</span>
              <span>The cost of running the dealership — lot space, staff, insurance, advertising, and financing. This is spread across all cars sold.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 min-w-fit">Profit margin:</span>
              <span>Dealers need a margin to stay in business. On average, used car profit margins range from $1,000 to $3,000 per vehicle, though high-demand models can command more.</span>
            </li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">
            A certified pre-owned (CPO) vehicle will usually be priced higher than a
            non-certified equivalent because the dealer has invested in a multi-point
            inspection and backs it with an extended warranty. That premium reflects real
            cost, not just markup.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Wholesale Auctions and Trade-In Values
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Wholesale auctions are where most used cars change hands between businesses. Companies
            like Manheim and ADESA run auctions where dealers, rental fleets, and leasing companies
            sell vehicles in bulk. Wholesale prices are typically 15–30% below retail because
            the buyer (usually a dealer) still has to invest in reconditioning and resale.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Trade-in values are closely tied to wholesale prices. When you trade in your car at
            a dealership, the offer you receive is roughly what the dealer thinks they can sell
            it for at auction, minus a margin for their risk and holding costs. That is why
            trade-in values are almost always lower than what you could get selling privately —
            you are essentially giving up convenience in exchange for a lower price.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            If the difference between trade-in and private-sale value is large enough to justify
            the effort of listing, showing, and negotiating with individual buyers, selling
            privately can put significantly more money in your pocket.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Private Sale Pricing
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Private sellers — individuals selling their own cars — generally price somewhere
            between wholesale and dealer retail. They do not have overhead costs, but they
            also cannot offer warranties or financing. The trade-off for buyers is a lower
            price in exchange for fewer protections.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Private sale prices are heavily influenced by the seller&apos;s motivation. Someone
            who needs to sell before a move next week will price aggressively. Someone who
            is in no rush and has an emotional attachment to their car might price above
            market and wait for the right buyer.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            This variation in seller motivation is one of the main reasons you will see the
            same make, model, and mileage at significantly different prices on platforms
            like Craigslist, Facebook Marketplace, and AutoTrader.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Why Geography Matters
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Used car prices vary meaningfully by region. A four-wheel-drive truck in Colorado
            or the Pacific Northwest will command a premium because demand is higher in areas
            with snow and rough terrain. The same truck in Miami, where buyers prioritize
            fuel economy and convertibles, might sell for thousands less.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Rust-belt states with harsh winters and road salt see lower values on older
            vehicles because of accelerated corrosion. Cars from the Southwest, which spend
            their lives in dry climates, often carry a geographic premium because the body
            and undercarriage are in better condition.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            If you are shopping for a specific vehicle, it can be worth looking at listings
            in nearby states. The savings from a lower-price market can outweigh the cost
            of a short road trip to pick up the car — just factor in taxes and registration
            rules for your home state.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Seasonal Trends in Used Car Prices
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The used car market has predictable seasonal patterns. Tax refund season (February
            through April) brings more buyers into the market, which tends to push prices up.
            Convertibles and sports cars see higher demand in spring and summer. SUVs and
            trucks often spike in fall as buyers prepare for winter.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            The end of the year — November and December — is often a good time to buy because
            dealers are trying to clear inventory before year-end accounting. Private sellers
            who have not found a buyer all fall may also be willing to negotiate more
            aggressively as the holidays approach.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            How Online Pricing Tools Work
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Tools like Kelley Blue Book, Edmunds, and Fair Price Predictor estimate values
            by analyzing data from real vehicle listings and transactions. The approach
            varies, but the general method involves collecting large datasets of asking
            prices (and sometimes sale prices), then building statistical or machine-learning
            models that predict price based on the vehicle&apos;s attributes.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Our tool uses a blend of two machine-learning models — FastAI Tabular and
            CatBoost — trained on over 300,000 real listings. The models learn complex
            relationships between features like make, model, year, mileage, condition, and
            location to produce a price estimate. You can read more about the technical
            details on our{' '}
            <Link href="/methodology" className="text-green-600 dark:text-green-400 hover:underline">
              methodology page
            </Link>.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            No automated estimate is perfect. These tools cannot inspect the car, check the
            service history, or detect hidden damage. They are best used as a starting point
            for research — a way to quickly understand the ballpark value before you dig
            deeper into a specific vehicle.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            The Gap Between Asking Price and Selling Price
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Asking prices — what you see in listings — are not the same as selling prices.
            Most used cars sell for less than the listed price. The typical discount depends
            on how long the car has been on the market and how motivated the seller is. A
            freshly listed car from a dealer might sell at close to asking price if demand
            is strong, while a car that has sat for 60 days may sell for 5–10% below asking.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            When you use a pricing tool to estimate value, keep in mind that the result
            reflects the broad market — it is not a guarantee of what any specific seller
            will accept. Treat the estimate as a benchmark for negotiation, not a ceiling
            or floor.
          </p>
        </section>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Related Guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/what-affects-used-car-value"
              className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 transition-colors"
            >
              <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">What Affects Used Car Value</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-green-500 ml-auto transition-colors" />
            </Link>
            <Link
              href="/buying-a-used-car-guide"
              className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 transition-colors"
            >
              <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Complete Buying Guide</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-green-500 ml-auto transition-colors" />
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:underline">
              Try the Price Predictor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
