import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { getServiceIcon, getServiceImage } from './serviceIcons'

export default function ServiceCard({ service }) {
  const Icon = getServiceIcon(service.icon)
  const imageUrl = getServiceImage(service.icon)

  return (
    <Link
      to="/services"
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lift"
    >
      {/* Cover Image Section */}
      <div className="h-32 w-full shrink-0 overflow-hidden bg-line">
        <img
          src={imageUrl}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100 shadow-sm">
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

        <p className="mt-4 font-mono text-xs text-ink mt-auto pt-2">
          <span className="text-muted">from </span>&#8377;{service.starting_price}
        </p>
      </div>
    </Link>
  )
}
