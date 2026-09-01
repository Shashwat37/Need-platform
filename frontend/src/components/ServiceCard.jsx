import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { getServiceIcon } from './serviceIcons'

/**
 * ServiceCard.jsx — one service tile (Electrician, AC Service, ...).
 *
 * The `service` object comes straight from the backend's /api/services
 * response, so this component works without any extra data shaping.
 */
export default function ServiceCard({ service }) {
  const Icon = getServiceIcon(service.icon)

  return (
    <Link
      to="/services"
      className="card group flex flex-col p-5 transition-shadow hover:shadow-lift"
    >
      <div className="flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100">
          <Icon size={20} strokeWidth={2} />
        </span>
        <ArrowUpRight
          size={16}
          className="text-line transition-colors group-hover:text-brand-600"
        />
      </div>

      <h3 className="mt-4 font-display text-base font-bold text-ink">{service.name}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
        {service.description}
      </p>

      <p className="mt-4 font-mono text-xs text-ink">
        <span className="text-muted">from </span>&#8377;{service.starting_price}
      </p>
    </Link>
  )
}
