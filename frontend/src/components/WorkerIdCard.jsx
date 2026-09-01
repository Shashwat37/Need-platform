import { MapPin, ShieldCheck, Star } from 'lucide-react'

/**
 * WorkerIdCard.jsx — the cooperative member card.
 *
 * This is the signature component of ShramSetu. A worker here is not an
 * anonymous gig contractor: they are a member of a cooperative society, and
 * this card is the artifact that proves it — society name, member ID, and a
 * verification stamp.
 *
 * It appears in the landing page hero, and the SAME component is reused for
 * worker search results in Step 7, so the idea stays consistent everywhere.
 */

// Each verification state gets its own colour and label.
const STATUS_STYLES = {
  verified: {
    label: 'Verified',
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

/** "Rahul Kumar" -> "RK". Used for the avatar when there is no photo. */
function getInitials(fullName) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export default function WorkerIdCard({
  name,
  trade,
  society,
  memberId,
  rating,
  jobs,
  area,
  status = 'verified',
  animateStamp = false,
}) {
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending

  return (
    <article className="card overflow-hidden shadow-lift">
      {/* Top band — the issuing society, like the header of a real ID card */}
      <div className="flex items-center justify-between bg-ink px-5 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
          {society}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-marigold-400">
          Member card
        </span>
      </div>

      <div className="relative p-5">
        {/* Verification stamp, sitting slightly rotated like a real stamp */}
        <div
          className={`absolute right-4 top-4 flex items-center gap-1.5 rounded-md border-2 px-2 py-1 ${statusStyle.className} ${
            animateStamp ? 'stamp-in' : ''
          }`}
          style={animateStamp ? undefined : { transform: 'rotate(-7deg)' }}
        >
          <ShieldCheck size={13} strokeWidth={2.5} />
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em]">
            {statusStyle.label}
          </span>
        </div>

        {/* Avatar + name + trade */}
        <div className="flex items-center gap-3.5">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 font-display text-lg font-extrabold text-brand-700">
            {getInitials(name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-bold text-ink">{name}</h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-700">
              {trade}
            </p>
          </div>
        </div>

        {/* Three facts a customer actually decides on */}
        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
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
              Works in
            </dt>
            <dd className="mt-1 flex items-center gap-1 truncate text-sm font-medium text-ink">
              <MapPin size={13} className="shrink-0 text-muted" />
              <span className="truncate">{area}</span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Member ID footer — mono type, because it is a reference number */}
      <div className="flex items-center justify-between border-t border-line bg-paper px-5 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Member ID
        </span>
        <span className="font-mono text-xs font-medium text-ink">{memberId}</span>
      </div>
    </article>
  )
}
