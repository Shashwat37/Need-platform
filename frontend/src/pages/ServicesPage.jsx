/**
 * ServicesPage.jsx — full Service Catalogue & Worker Search directory.
 *
 * WHAT: Browse all 20 cooperative services across categories, or search and
 *       compare verified cooperative service providers (workers) by trade,
 *       rating, jobs done, and location.
 *
 * WHY:  Allows customers to explore transparent pricing and choose verified
 *       workers directly without algorithmic mystery.
 *
 * HOW:  Fetches services from /api/services and verified workers from /api/workers.
 *       Supports instant search, category filtering, sorting, and seamless
 *       transitions between service catalog and worker cards.
 */

import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Filter,
  Grid,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { getServices, getWorkers } from '../services/api'
import { getServiceIcon, getServiceImage } from '../components/serviceIcons'
import WorkerIdCard from '../components/WorkerIdCard'
import SectionHeading from '../components/SectionHeading'
import BookingModal from '../components/BookingModal'
import { useLanguage } from '../context/LanguageContext'

const CATEGORIES = [
  'All',
  'Home Services',
  'Appliance Services',
  'Other Services',
]

export default function ServicesPage() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'
  const initialTrade    = searchParams.get('trade') || ''
  const initialMode     = searchParams.get('mode') || (initialTrade ? 'workers' : 'services')

  const [mode, setMode] = useState(initialMode) // 'services' | 'workers'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedTrade, setSelectedTrade]       = useState(initialTrade)
  const [searchQuery, setSearchQuery]           = useState('')
  const [sortBy, setSortBy]                     = useState('rating') // 'rating' | 'jobs' | 'experience'

  // Booking modal state
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    service: null,
    worker: null,
  })

  // Data states
  const [services, setServices] = useState([])
  const [workers, setWorkers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  // Load services and workers on mount
  function loadAllData() {
    setLoading(true)
    setError('')
    Promise.all([getServices(), getWorkers({ verified_only: true })])
      .then(([servicesData, workersData]) => {
        setServices(servicesData)
        setWorkers(workersData)
      })
      .catch(err => {
        setError('Could not load service catalogue. Please check if the backend is running.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(loadAllData, [])

  // Sync mode changes to URL if useful
  function handleSelectMode(newMode) {
    setMode(newMode)
    if (newMode === 'services' && selectedTrade) {
      setSelectedTrade('')
    }
  }

  // Quick action: view workers for a given service
  function handleViewWorkersForService(serviceName) {
    setSelectedTrade(serviceName)
    setMode('workers')
  }

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesCategory =
        selectedCategory === 'All' || s.category === selectedCategory
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query)) ||
        s.category.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [services, selectedCategory, searchQuery])

  // Filtered Workers List
  const filteredWorkers = useMemo(() => {
    let result = workers.filter(w => {
      const matchesTrade = !selectedTrade || w.trade.toLowerCase() === selectedTrade.toLowerCase()
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        !query ||
        w.name.toLowerCase().includes(query) ||
        w.trade.toLowerCase().includes(query) ||
        (w.skills && w.skills.toLowerCase().includes(query)) ||
        (w.area && w.area.toLowerCase().includes(query))
      return matchesTrade && matchesSearch
    })

    // Sorting
    if (sortBy === 'jobs') {
      result.sort((a, b) => b.total_jobs - a.total_jobs)
    } else if (sortBy === 'experience') {
      result.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0))
    } else {
      // Default: rating
      result.sort((a, b) => b.rating - a.rating || b.total_jobs - a.total_jobs)
    }

    return result
  }, [workers, selectedTrade, searchQuery, sortBy])

  // Distinct trade list for worker filtering dropdown
  const availableTrades = useMemo(() => {
    const trades = new Set(services.map(s => s.name))
    workers.forEach(w => trades.add(w.trade))
    return Array.from(trades).sort()
  }, [services, workers])

  return (
    <div className="min-h-screen">

      {/* ── Hero Search Section ────────────────────────────────────────── */}
      <section className="border-b border-line bg-paper/60 py-12">
        <div className="container-page text-center">
          <p className="eyebrow mx-auto justify-center flex items-center gap-2">
            <span className="h-px w-6 bg-brand-600/40" />
            Verified Cooperative Marketplace
            <span className="h-px w-6 bg-brand-600/40" />
          </p>

          <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            {t('services_page_title', 'Verified Home & Trade Services')}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {t('services_page_subtitle', 'Book certified artisans and skilled technicians supported by local Labour Cooperatives')}
          </p>

          {/* Unified Search Input */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder', 'Search services (e.g. Electrician, Plumber, AC Repair)...')}
                className="w-full rounded-2xl border border-line bg-white py-3.5 pl-11 pr-10 text-sm text-ink shadow-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-muted hover:text-ink"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <div className="container-page py-10 space-y-8">

        {/* Mode Switch & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          {/* Dual Mode Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-line bg-paper p-1">
            <button
              onClick={() => handleSelectMode('services')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                mode === 'services'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Grid size={15} />
              Browse Services ({services.length})
            </button>
            <button
              onClick={() => handleSelectMode('workers')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                mode === 'workers'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Users size={15} />
              Find Verified Workers ({workers.length})
            </button>
          </div>

          {/* Contextual Filters */}
          {mode === 'services' ? (
            /* Category Pills */
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-line bg-white text-muted hover:border-ink/30 hover:text-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : (
            /* Worker Trade & Sort Controls */
            <div className="flex flex-wrap items-center gap-3">
              {/* Trade Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted">Trade:</span>
                <select
                  value={selectedTrade}
                  onChange={e => setSelectedTrade(e.target.value)}
                  className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">All Trades</option>
                  {availableTrades.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="rating">Top Rated (★)</option>
                  <option value="jobs">Most Jobs Completed</option>
                  <option value="experience">Years of Experience</option>
                </select>
              </div>

              {selectedTrade && (
                <button
                  onClick={() => setSelectedTrade('')}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                >
                  <X size={13} />
                  Reset Filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-line" />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="card py-16 text-center">
            <AlertCircle size={36} className="mx-auto mb-3 text-red-500" />
            <p className="text-muted">{error}</p>
            <button onClick={loadAllData} className="btn btn-primary mt-4">
              Retry
            </button>
          </div>
        )}

        {/* ── MODE 1: SERVICE CATALOGUE GRID ───────────────────────────── */}
        {!loading && !error && mode === 'services' && (
          <div>
            {filteredServices.length === 0 ? (
              <div className="card py-16 text-center">
                <Wrench size={36} className="mx-auto mb-3 text-muted/60" />
                <p className="font-semibold text-ink">No services found matching "{searchQuery}"</p>
                <p className="mt-1 text-xs text-muted">Try a different search term or category filter.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="btn btn-outline mt-4"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredServices.map(service => {
                  const Icon = getServiceIcon(service.icon)
                  const imageUrl = getServiceImage(service.icon)
                  return (
                    <article
                      key={service.id}
                      className="card group flex flex-col justify-between overflow-hidden transition hover:shadow-lift"
                    >
                      {/* Image Header */}
                      <div className="h-40 w-full shrink-0 overflow-hidden bg-line relative">
                        <img 
                          src={imageUrl} 
                          alt={service.name} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <span className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white shadow-sm">
                          {service.category.replace(' Services', '')}
                        </span>
                      </div>
                      
                      <div className="flex flex-col flex-1 p-5 pt-0">
                        <div>
                          {/* Card Header: Icon */}
                          <div className="flex items-start justify-between -mt-6 mb-2">
                            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-100 group-hover:scale-105 shadow-sm border-[3px] border-white relative z-10">
                              <Icon size={22} strokeWidth={2} />
                            </span>
                          </div>

                          {/* Title & Description */}
                          <h3 className="font-display text-lg font-bold text-ink">
                          {service.name}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
                          {service.description}
                        </p>
                      </div>

                      {/* Card Footer: Price & Find Workers action */}
                      <div className="mt-5 border-t border-line/60 pt-4 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-mono tracking-wider text-muted">Standard rate</p>
                          <p className="font-mono text-sm font-bold text-ink">
                            from ₹{service.starting_price}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewWorkersForService(service.name)}
                            className="flex items-center gap-1 rounded-xl border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:bg-white hover:text-ink"
                            title="View all workers for this trade"
                          >
                            <span>Workers</span>
                            <ArrowRight size={12} />
                          </button>
                          <button
                            onClick={() => setBookingModal({ isOpen: true, service: service, worker: null })}
                            className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-700 shadow-sm"
                          >
                            Book Service
                          </button>
                        </div>
                      </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MODE 2: WORKER DIRECTORY SEARCH ──────────────────────────── */}
        {!loading && !error && mode === 'workers' && (
          <div className="space-y-6">
            {/* Header / Active Filter Notice */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-50/60 border border-brand-100 rounded-2xl p-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-verified shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {selectedTrade
                      ? `Showing Verified ${selectedTrade} Providers`
                      : 'All Cooperative Verified Workers'}
                  </p>
                  <p className="text-xs text-muted">
                    Members of the worker cooperative. Certified identity, transparent rate cards, zero middleman cut.
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs font-bold text-brand-700 bg-white border border-brand-200 px-3 py-1 rounded-full">
                {filteredWorkers.length} Verified {filteredWorkers.length === 1 ? 'Worker' : 'Workers'} Available
              </span>
            </div>

            {/* Workers Grid */}
            {filteredWorkers.length === 0 ? (
              <div className="card py-16 text-center">
                <Users size={36} className="mx-auto mb-3 text-muted/60" />
                <p className="font-semibold text-ink">No verified workers found</p>
                <p className="mt-1 text-xs text-muted">
                  {selectedTrade
                    ? `No verified workers found for "${selectedTrade}".`
                    : 'Try clearing your search query.'}
                </p>
                <button
                  onClick={() => { setSelectedTrade(''); setSearchQuery(''); }}
                  className="btn btn-outline mt-4"
                >
                  View All Workers
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredWorkers.map(w => {
                  const matchingService = services.find(s => s.name.toLowerCase() === w.trade.toLowerCase())
                  return (
                    <div key={w.worker_id} className="flex flex-col justify-between">
                      <WorkerIdCard
                        name={w.name}
                        trade={w.trade}
                        society="NEED Cooperative Fed."
                        memberId={`SHR-2026-${w.worker_id.toString().padStart(4, '0')}`}
                        rating={w.rating}
                        jobs={w.total_jobs}
                        area={w.area}
                        status={w.verification_status}
                      />

                      {/* Quick Booking Action Bar */}
                      <div className="mt-2.5 flex items-center justify-between rounded-xl border border-line bg-white px-4 py-2.5 shadow-sm">
                        <div>
                          <p className="font-mono text-xs font-bold text-ink">
                            ₹{w.starting_price} <span className="font-sans text-[11px] font-normal text-muted">base fare</span>
                          </p>
                          {w.experience_years > 0 && (
                            <p className="text-[11px] text-muted">{w.experience_years}y exp • {w.certifications || 'Verified'}</p>
                          )}
                        </div>

                        <button
                          onClick={() => setBookingModal({
                            isOpen: true,
                            service: matchingService || null,
                            worker: w,
                          })}
                          className="btn btn-primary text-xs py-1.5 px-3.5"
                        >
                          Book Worker
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Active Booking Modal ───────────────────────────────────────── */}
      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false, service: null, worker: null })}
        service={bookingModal.service}
        worker={bookingModal.worker}
        allServices={services}
      />

    </div>
  )
}
