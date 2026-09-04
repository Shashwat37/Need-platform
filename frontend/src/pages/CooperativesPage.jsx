/**
 * CooperativesPage.jsx — Public Labour Cooperatives Directory & Local Discovery.
 */

import { useEffect, useState } from 'react'
import { Award, Building2, CheckCircle2, Loader2, MapPin, Phone, ShieldCheck, Users, Wrench } from 'lucide-react'
import { getCooperatives } from '../services/api'
import { useLanguage } from '../context/LanguageContext'

export default function CooperativesPage() {
  const { t } = useLanguage()
  const [cooperatives, setCooperatives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCooperatives()
      .then(setCooperatives)
      .catch(() => setError('Failed to load registered cooperatives.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1 text-xs font-semibold text-brand-700 mb-3">
          <Building2 size={14} />
          Federation Network
        </div>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">
          {t('coop_page_title', 'Registered Labour Cooperatives & Unions')}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {t('coop_page_subtitle', 'Explore worker-owned societies providing certified, background-checked service partners')}
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-brand-600" size={32} />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cooperatives.map((coop) => (
            <div
              key={coop.id}
              className="flex flex-col justify-between rounded-2xl border border-line bg-white p-6 shadow-xs hover:shadow-md transition duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200">
                    <Building2 size={24} />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <ShieldCheck size={12} />
                    {coop.verification_badge || 'Government Registered'}
                  </span>
                </div>

                <h3 className="font-display text-base font-bold text-ink leading-snug">{coop.name}</h3>
                <p className="mt-1 text-xs text-muted font-mono">{coop.registration_number}</p>

                <p className="mt-3 text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {coop.description}
                </p>

                <div className="mt-4 space-y-2 border-t border-line pt-3">
                  <div className="flex items-center gap-2 text-xs text-ink font-medium">
                    <MapPin size={14} className="text-brand-600 shrink-0" />
                    <span>{coop.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-ink font-medium">
                    <Wrench size={14} className="text-brand-600 shrink-0" />
                    <span className="truncate">{coop.service_categories}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-ink font-medium">
                    <Phone size={14} className="text-brand-600 shrink-0" />
                    <span>{coop.contact_phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-line pt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <Users size={15} />
                  <span>{coop.active_worker_count} Active Members</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  ★ {coop.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
