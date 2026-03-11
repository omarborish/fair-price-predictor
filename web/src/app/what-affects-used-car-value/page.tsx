import type { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, ArrowRight, Gauge, Calendar, Star, Paintbrush, MapPin, Fuel, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'What Affects Used Car Value — Every Factor Explained | Fair Price Predictor',
  description: 'A detailed breakdown of every factor that raises or lowers a used car\'s price: mileage, age, condition, trim, accident history, color, regional demand, and more.',
  openGraph: {
    title: 'What Affects Used Car Value',
    description: 'Every factor that determines what a used car is worth, explained in plain language.',
  },
};

export default function WhatAffectsValuePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <section className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-purple-200 text-sm mb-3">
            <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
            <span>/</span>
            <span>What Affects Used Car Value</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            What Affects Used Car Value
          </h1>
          <p className="text-lg text-purple-100 max-w-2xl">
            Dozens of factors determine what a used car is worth. Some are obvious, like
            mileage and age. Others — like color, where the car is being sold, and even
            what time of year it is — can swing the price by hundreds or thousands of
            dollars. Here is every major factor, explained.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* Year and Age */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Year and Age
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Age is the single biggest driver of depreciation. A new car loses roughly 20%
            of its value in the first year and about 15% per year for the next four years.
            By year five, most vehicles are worth around 40% of their original MSRP.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            After five years, the rate of depreciation slows significantly. This is why
            buying a 3–5 year old car is often the financial sweet spot: someone else has
            absorbed the steepest depreciation, and you still get a relatively modern vehicle
            with years of useful life ahead.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Some vehicles hold their value better than others. Toyota trucks and Jeep
            Wranglers, for example, depreciate much more slowly than most luxury sedans
            because demand for them stays strong in the used market. You can explore
            depreciation patterns for specific makes on our{' '}
            <Link href="/insights/depreciation-by-year" className="text-green-600 dark:text-green-400 hover:underline">depreciation insights page</Link>.
          </p>
        </section>

        {/* Mileage */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Gauge className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Mileage
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The average American drives about 12,000–15,000 miles per year. A car with
            significantly fewer miles than average for its age commands a premium; one with
            significantly more trades at a discount.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The popular belief that a car becomes worthless after 100,000 miles is outdated.
            Modern engines and transmissions routinely last 200,000 miles or more with
            proper maintenance. What matters more than the absolute number is the ratio
            of miles to age and whether the maintenance schedule has been followed.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Highway miles are generally easier on a vehicle than city miles. A car that
            accumulated 80,000 miles from long highway commutes may be in better mechanical
            shape than one with 50,000 miles of stop-and-go city driving. Unfortunately,
            there is no way to verify this from a listing — it requires a physical inspection.
            See our{' '}
            <Link href="/insights/mileage-impact" className="text-green-600 dark:text-green-400 hover:underline">mileage impact analysis</Link>{' '}
            for data on how mileage affects prices across different makes.
          </p>
        </section>

        {/* Condition */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Condition
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Condition is typically graded on a scale: excellent, good, fair, and poor. Each
            step down the scale can reduce value by 10–20%, depending on the vehicle. The
            three areas that matter most are:
          </p>
          <div className="space-y-3 text-slate-600 dark:text-slate-400 mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Mechanical condition</h3>
              <p>Engine health, transmission function, brake wear, suspension, and tire condition. Mechanical problems are the most expensive to fix and have the largest impact on value.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Exterior condition</h3>
              <p>Paint quality, dents, scratches, rust, and glass condition. Cosmetic damage is cheaper to repair but can make a car look neglected, which hurts perceived value.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Interior condition</h3>
              <p>Seat wear, dashboard cracks, stains, odors, and the state of controls and electronics. A clean, well-maintained interior signals that the previous owner took care of the vehicle.</p>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            A car in &ldquo;excellent&rdquo; condition with full service records can command a price
            well above market average. Conversely, a car in &ldquo;fair&rdquo; condition with deferred
            maintenance should sell well below average — and if it does not, you are
            overpaying.
          </p>
        </section>

        {/* Make, Model, Trim */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Make, Model, and Trim Level
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Brand reputation matters. Toyota and Honda have strong resale values because
            buyers trust their reliability. German luxury brands (BMW, Mercedes, Audi)
            depreciate faster in percentage terms because maintenance and repair costs are
            higher, which reduces demand in the used market.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Trim level — the package of features on a specific model — also affects value.
            A fully loaded top-trim Camry (leather seats, sunroof, premium audio, advanced
            safety features) will sell for more than a base-trim version of the same year
            and mileage. However, the premium narrows as the car ages: buyers of older
            vehicles care more about mechanical reliability than luxury features.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Popular body styles also matter. SUVs and trucks hold value better than sedans
            in most markets because demand has shifted toward larger vehicles. Compact cars
            can be excellent value buys precisely because they are less popular despite being
            cheaper to own and operate.
          </p>
        </section>

        {/* Accident History */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Accident and Damage History
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            A reported accident reduces a car&apos;s value even if the repairs were done
            properly. Studies suggest that a vehicle with an accident on record loses 10–25%
            of its value compared to an identical clean-history vehicle, depending on the
            severity of the damage.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Minor incidents (parking lot dings, small fender benders under $1,000 in damage)
            have a smaller impact than major collisions involving airbag deployment or
            structural repair. Frame damage is the most serious: even with expert repair, a
            car with frame damage may never drive quite the same and can be difficult to
            resell.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Title status is directly related to damage history. A salvage or rebuilt title
            means an insurance company declared the car a total loss at some point. These
            vehicles can be 30–50% cheaper than clean-title equivalents, but they come with
            significant risks and insurance complications. See our{' '}
            <Link href="/buying-a-used-car-guide" className="text-green-600 dark:text-green-400 hover:underline">buying guide</Link>{' '}
            for more on title types.
          </p>
        </section>

        {/* Color */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
              <Paintbrush className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Color
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            It might seem trivial, but color measurably affects resale value. Neutral colors
            — white, black, gray, and silver — are the safest bets because they appeal to
            the widest range of buyers. Cars in these colors tend to sell faster and for
            slightly higher prices than unusual colors.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Bright or unusual colors (yellow, orange, bright green) can either help or hurt
            depending on the vehicle. A yellow Jeep Wrangler or a red Mustang may actually
            command a small premium because the color fits the car&apos;s personality. A
            bright orange family sedan, on the other hand, limits your buyer pool and can
            sit on the market longer.
          </p>
        </section>

        {/* Fuel Type and Drivetrain */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <Fuel className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Fuel Type and Drivetrain
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Gas prices influence used car demand. When fuel is expensive, fuel-efficient cars
            and hybrids see higher demand and better resale values. When gas is cheap, truck
            and SUV values strengthen.
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Electric vehicles (EVs) are a unique case. Used EVs depreciate quickly because
            battery technology is improving rapidly — a 3-year-old EV has significantly less
            range and fewer features than a current model. However, this makes used EVs
            potentially great deals for buyers who are comfortable with the existing range.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Drivetrain matters regionally. All-wheel drive (AWD) and four-wheel drive (4WD)
            command premiums in snowy states but add little value in warm climates. Our{' '}
            <Link href="/insights/drivetrain-premium" className="text-green-600 dark:text-green-400 hover:underline">drivetrain premium analysis</Link>{' '}
            shows exactly how much AWD/4WD adds to prices across different vehicle types.
          </p>
        </section>

        {/* Regional Demand */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Regional Demand and Supply
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The same car can be worth thousands more or less depending on where it is being
            sold. Pickup trucks command higher prices in rural areas and the Mountain West.
            Small, fuel-efficient cars sell better in urban areas and on the coasts. Cars
            from dry, salt-free climates (Arizona, Southern California) are worth more
            because they have less rust and body deterioration.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Local economic conditions also play a role. Areas with higher incomes tend to
            have higher asking prices. Areas with military bases often have a large supply
            of late-model used cars from service members who are relocating, which can push
            prices down for buyers in those areas.
          </p>
        </section>

        {/* Service History */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Service History and Maintenance Records
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            A complete service history — documented oil changes, tire rotations, and
            scheduled maintenance — adds meaningful value. It tells the buyer that the
            previous owner cared for the vehicle and followed the manufacturer&apos;s
            maintenance schedule.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Conversely, a car with no records forces the buyer to assume the worst. If
            you are selling, keeping your service records organized is one of the easiest
            ways to protect your car&apos;s resale value.
          </p>
        </section>

        {/* Market Trends */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Broader Market Trends
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The used car market is sensitive to macroeconomic forces. During the 2020–2022
            chip shortage, new car production dropped and used car prices surged to
            historically high levels. As new car supply has normalized, used prices have
            gradually declined but remain above pre-pandemic levels for many models.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Interest rates also affect the market. Higher rates make financing more
            expensive, which reduces demand and pushes prices down. Lower rates stimulate
            buying and put upward pressure on prices. These macroeconomic factors are
            outside any individual buyer&apos;s control, but understanding them helps you
            decide whether now is a good or bad time to buy.
          </p>
        </section>

        {/* Related */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Related Guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/how-used-car-pricing-works"
              className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">How Used Car Pricing Works</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 ml-auto transition-colors" />
            </Link>
            <Link
              href="/buying-a-used-car-guide"
              className="group flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Complete Buying Guide</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 ml-auto transition-colors" />
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">
              Check what your car is worth <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
