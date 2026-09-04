import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  PiggyBank,
  ReceiptText,
  Search,
  ShieldCheck,
} from 'lucide-react'

import SectionHeading from '../components/SectionHeading'
import ServiceCard from '../components/ServiceCard'
import WorkerIdCard from '../components/WorkerIdCard'
import { getServicesByCategory, getStats } from '../services/api'
import { useLanguage } from '../context/LanguageContext'

/**
 * LandingPage.jsx — the home page.
 *
 * The numbers and the service list are NOT typed into this file. They are
 * fetched from the Flask backend, so what you see in the browser is what is
 * actually in the database. During the demo you can add a worker and watch
 * the count on this page go up.
 */

const STEPS = [
  {
    title: 'Tell us what you need',
    body: 'Pick from twenty services across home repair, appliances and personal care.',
  },
  {
    title: 'Compare verified workers',
    body: 'See ratings, jobs completed and how far away each worker is before you decide.',
  },
  {
    title: 'Book a slot',
    body: 'Choose a date and time. The worker accepts or declines, so nobody is forced.',
  },
  {
    title: 'Pay on completion',
    body: 'Pay by UPI, card or cash. You get an invoice showing exactly where the money went.',
  },
  {
    title: 'Rate and tip',
    body: 'Your rating builds the worker’s record. A tip goes to them in full.',
  },
]

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Verified workers',
    body: 'Identity and skill documents are checked by the cooperative before a worker appears in search results.',
  },
  {
    icon: IndianRupee,
    title: 'Fair wages',
    body: 'The platform is owned by its worker members, so the commission stays low and the worker keeps most of the bill.',
  },
  {
    icon: ReceiptText,
    title: 'Transparent payments',
    body: 'Every booking produces an invoice that both sides can see, with the welfare contribution listed as a line item.',
  },
  {
    icon: PiggyBank,
    title: 'Worker welfare',
    body: 'A small share of each job is set aside in the worker’s welfare wallet towards insurance and emergencies.',
  },
]

export default function LandingPage() {
  const { t } = useLanguage()
  const [stats, setStats] = useState(null)
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // useEffect with an empty [] runs once, right after the page first appears.
  useEffect(() => {
    async function loadData() {
      try {
        // Promise.all fires both requests together instead of waiting in turn.
        const [statsData, categoryData] = await Promise.all([
          getStats(),
          getServicesByCategory(),
        ])
        setStats(statsData)
        setCategories(categoryData)
      } catch (requestError) {
        setError(requestError)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Indian number formatting: 24500 -> 24,500
  const formatNumber = (value) => Math.round(value).toLocaleString('en-IN')

  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        {/* Soft background wash. aria-hidden because it carries no meaning. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60rem 32rem at 88% -12%, #E8F3F1 0%, rgba(232,243,241,0) 62%)',
          }}
        />

        <div className="container-page relative grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="rise">
            <p className="eyebrow">{t('hero_badge', '🇮🇳 India’s 1st Worker-Owned Cooperative Platform')}</p>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              {t('hero_title', 'Empowering India’s Blue-Collar Service Partners')}
            </h1>

            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
              {t('hero_subtitle', 'NEED is a cooperative home-service marketplace. 85% goes directly to the worker, 5% to their Labour Cooperative Union, and 10% auto-funds their Welfare Wallet.')}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services" className="btn btn-primary">
                {t('hero_cta_book', 'Explore Services & Book')}
                <ArrowRight size={17} />
              </Link>
              <Link to="/cooperatives" className="btn btn-outline">
                <Search size={17} />
                {t('hero_cta_coop', 'Browse Labour Cooperatives')}
              </Link>
            </div>

            {/* Live counts from the database */}
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-7">
              <div>
                <dd className="font-display text-3xl font-extrabold text-ink">
                  {stats ? formatNumber(stats.verified_workers) : '—'}
                </dd>
                <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  Verified workers
                </dt>
              </div>
              <div>
                <dd className="font-display text-3xl font-extrabold text-ink">
                  {stats ? formatNumber(stats.total_services) : '—'}
                </dd>
                <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  Services offered
                </dt>
              </div>
              <div>
                <dd className="font-display text-3xl font-extrabold text-ink">
                  {stats ? `₹${formatNumber(stats.welfare_total)}` : '—'}
                </dd>
                <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  In welfare wallets
                </dt>
              </div>
            </dl>
          </div>

          {/* Right side: the cooperative member card, and what a bill looks like */}
          <div className="mx-auto w-full max-w-sm lg:mx-0 lg:ml-auto">
            <WorkerIdCard
              name="Sunita Devi"
              trade="Electrician"
              society="Nehru Nagar Workers Society"
              memberId="SS-EL-0142"
              rating="4.8"
              jobs={126}
              area="Nehru Nagar"
              status="verified"
              animateStamp
            />

            {/* The whole argument of the project, in one bar */}
            <div className="card mt-4 p-5">
              <p className="eyebrow">Where a &#8377;500 job goes</p>
              <div className="mt-3.5 flex h-2.5 overflow-hidden rounded-full bg-line">
                <span className="bg-brand-600" style={{ width: '90%' }} />
                <span className="bg-marigold-500" style={{ width: '10%' }} />
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[11px]">
                <span className="text-ink">&#8377;450 &mdash; the worker</span>
                <span className="text-muted">&#8377;50 &mdash; welfare fund</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- BACKEND DOWN NOTICE */}
      {error && (
        <div className="container-page pt-10">
          <div className="flex items-start gap-3 rounded-xl border border-rejected/30 bg-rejected/5 p-5">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-rejected" />
            <div className="text-sm">
              <p className="font-semibold text-ink">
                Cannot reach the backend on port 5000.
              </p>
              <p className="mt-1 text-muted">
                The page is showing blanks instead of invented numbers. Open a
                second terminal and run:
              </p>
              <code className="mt-2.5 block rounded-lg bg-ink px-3 py-2 font-mono text-xs text-white">
                cd backend
                <br />
                python app.py
              </code>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ SERVICES */}
      <section className="container-page py-20">
        <SectionHeading
          eyebrow="What we do"
          title="Twenty services, one trusted list"
          description="Every worker listed under these services has been through the cooperative's verification process."
        />

        {isLoading ? (
          // Placeholder boxes so the layout does not jump when data lands.
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className="card h-40 animate-pulse bg-white/60" />
            ))}
          </div>
        ) : (
          <div className="mt-12 space-y-14">
            {categories.map((group) => (
              <div key={group.category}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl font-bold text-ink">
                    {group.category}
                  </h3>
                  <span className="font-mono text-xs text-muted">
                    {group.services.length} services
                  </span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {group.services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* -------------------------------------------------------- HOW IT WORKS */}
      <section className="border-y border-line bg-white py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="How it works"
            title="Five steps from problem to paid"
            description="Numbered because the order genuinely matters — each step unlocks the next one."
          />

          <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="border-t-2 border-brand-100 pt-5">
                <span className="font-mono text-xs font-medium text-brand-700">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------------- WHY TRUST */}
      <section className="container-page py-20">
        <SectionHeading
          eyebrow="Why trust it"
          title="Four promises the software actually enforces"
          description="These are not slogans on a poster. Each one maps to a screen or a database rule you can open and inspect."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="card flex gap-4 p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <pillar.icon size={20} strokeWidth={2} />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-ink">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{pillar.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="container-page pb-4">
        <div className="overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center sm:px-14">
          <p className="eyebrow justify-center text-marigold-400">Join NEED</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Need work done, or looking for work?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/70">
            Customers book in under a minute. Workers join the cooperative, get
            verified, and start receiving jobs from their own area.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn btn-light">
              Create an account
              <ArrowRight size={17} />
            </Link>
            <Link to="/about" className="btn btn-ghost text-white hover:bg-white/10">
              How the cooperative works
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
