import { Award, CheckCircle2, MapPin, ShieldCheck, Star } from 'lucide-react'

/**
 * WorkerIdCard.jsx — the cooperative member card.
 *
 * Renders verified worker details along with explicit trust badges:
 *  - Identity Verified
 *  - Skill Verified
 *  - Cooperative Member
 */

const STATUS_STYLES = {
  verified: {
    label: 'Verified Member',
    className: 'border-verified/40 bg-verified/10 text-verified',
  },
  pending: {
    label: 'Pending',
    className: 'border-pending/40 bg-pending/10 text-pending',
  },
  rejected: {
    label: 'Rejected',
    className: 'border-rejected/40 bg-rejected/10 text-rejected',
  },
}

function getInitials(fullName) {
  return fullName
    ? fullName.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'W'
}

export default function WorkerIdCard({
  name,
  trade,
  society = 'Noida Artisans Cooperative Union',
  memberId,
  rating,
  jobs,
  area,
  status = 'verified',
  identityVerified = true,
  skillVerified = true,
  animateStamp = false,
}) {
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending

  return (
    <article className="card overflow-hidden shadow-lift transition hover:shadow-xl">
      {/* Top band — issuing cooperative */}
      <div className="flex items-center justify-between bg-ink px-5 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 font-bold truncate max-w-[200px]">
          {society}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-marigold-400 font-bold">
          Cooperative Member
        </span>
      </div>

      <div className="relative p-5">
        {/* Verification stamp */}
        <div
          className={`absolute right-4 top-4 flex items-center gap-1.5 rounded-md border-2 px-2 py-1 ${statusStyle.className} ${
            animateStamp ? 'stamp-in' : ''
          }`}
          style={animateStamp ? undefined : { transform: 'rotate(-7deg)' }}
        >
          <ShieldCheck size={13} strokeWidth={2.5} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
            {statusStyle.label}
          </span>
        </div>

        {/* Avatar + name + trade */}
        <div className="flex items-center gap-3.5">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 font-display text-lg font-extrabold text-brand-700 border border-brand-200">
            {getInitials(name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-bold text-ink">{name}</h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-700 font-semibold">
              {trade}
            </p>
          </div>
        </div>

        {/* Explicit Trust Badges */}
        <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-line pt-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={11} className="text-emerald-600" />
            Identity Verified
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200">
            <Award size={11} className="text-blue-600" />
            Skill Verified
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
            🏛️ Cooperative Member
          </span>
        </div>

        {/* Core Stats */}
        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Rating
            </dt>
            <dd className="mt-1 flex items-center gap-1 font-display font-bold text-ink">
              <Star size={14} className="fill-marigold-500 text-marigold-500" />
              {rating}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Jobs done
            </dt>
            <dd className="mt-1 font-display font-bold text-ink">{jobs}</dd>
          </div>
          <div className="min-w-0">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Service Area
            </dt>
            <dd className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-ink">
              <MapPin size={13} className="shrink-0 text-muted" />
              <span className="truncate">{area}</span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Member ID footer */}
      <div className="flex items-center justify-between border-t border-line bg-paper px-5 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted font-bold">
          Member ID
        </span>
        <span className="font-mono text-xs font-semibold text-ink">{memberId}</span>
      </div>
    </article>
  )
}
