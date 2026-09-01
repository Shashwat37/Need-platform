import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '../components/SectionHeading'

/**
 * About.jsx — explains the cooperative idea in plain words.
 *
 * This page is static text only (no backend call), so it is finished now
 * rather than left as a placeholder.
 */

const DIFFERENCES = [
  {
    them: 'A private company owns the platform and sets the commission.',
    us: 'The workers are members of the cooperative that owns the platform.',
  },
  {
    them: 'Commission is decided for the worker, and can rise at any time.',
    us: 'Members vote on the commission, and it funds welfare instead of profit.',
  },
  {
    them: 'A bad month is entirely the worker’s problem.',
    us: 'Part of every job is saved into the worker’s welfare wallet.',
  },
  {
    them: 'Ratings can end someone’s income with no explanation.',
    us: 'Verification and disputes are handled by the federation, with a record.',
  },
]

export default function About() {
  return (
    <div className="container-page py-16 lg:py-20">
      <SectionHeading
        eyebrow="About"
        title="A marketplace the workers own"
        description="NEED is built around one idea: the people doing the work should own the platform that finds them the work, and should keep most of what the customer pays."
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 text-[15px] leading-relaxed text-muted">
          <p>
            Local service workers — electricians, plumbers, cleaners, carpenters —
            usually find jobs through word of mouth. Work is irregular, prices are
            argued over every time, and there is no record of a good job well done.
            When they join a commercial app instead, they get a steady stream of
            work but hand over a large share of every bill, and have no say in how
            the rules are set.
          </p>
          <p>
            NEED is organised as a cooperative federation instead. Workers
            join a local society, get their identity and skills verified once, and
            then appear in customer search results with a member ID and a rating
            that belongs to them. The commission the platform charges is small and
            decided by the members, and a slice of every job is set aside in the
            worker’s own welfare wallet towards insurance and emergencies.
          </p>
          <p>
            For customers, the benefit is trust. You are not gambling on a stranger
            with a phone number. You can see that someone has been verified by
            their society, how many jobs they have completed, what previous
            customers said, and exactly what you will be charged before you book.
          </p>
          <p className="rounded-xl border border-line bg-white p-5 text-ink">
            This is a student project prototype built for a college demonstration.
            The payment flow is simulated end to end — invoices, welfare splits and
            wallet balances are all real database records, but no actual money
            moves and no real bank or UPI provider is connected.
          </p>
        </div>

        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
            The difference
          </h3>
          <ul className="mt-5 space-y-4">
            {DIFFERENCES.map((row) => (
              <li key={row.us} className="card p-5">
                <p className="text-sm leading-relaxed text-muted/80 line-through">
                  {row.them}
                </p>
                <p className="mt-2.5 border-l-2 border-brand-600 pl-3 text-sm font-medium leading-relaxed text-ink">
                  {row.us}
                </p>
              </li>
            ))}
          </ul>

          <Link to="/register" className="btn btn-primary mt-7">
            Join the cooperative
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  )
}
