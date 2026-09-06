/**
 * SubscriptionsPage.jsx — Cooperative Institutional Retainer & Maintenance Plans.
 * Enables PG/Hostels, Commercial Offices, and Local Industrial facilities to subscribe
 * to dedicated trade guild maintenance retainers on weekly, monthly, and yearly cycles.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Building,
  Building2,
  CheckCircle2,
  Clock,
  Factory,
  HelpCircle,
  Home,
  IndianRupee,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getSubscriptionPlans,
  createSubscription,
  getMySubscriptions,
  cancelSubscription,
} from '../services/api'
import SectionHeading from '../components/SectionHeading'

const ORG_TABS = [
  { id: 'all', label: 'All Organizations', icon: Building2 },
  { id: 'pg_hostel', label: 'PG & Hostels', icon: Home },
  { id: 'offices', label: 'Offices & Co-working', icon: Building },
  { id: 'industries', label: 'Local Industries', icon: Factory },
]

const BILLING_CYCLES = [
  { id: 'weekly', label: 'Weekly', discount: null },
  { id: 'monthly', label: 'Monthly', discount: 'Most Popular' },
  { id: 'yearly', label: 'Yearly', discount: 'Save 15%' },
]

export default function SubscriptionsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [plans, setPlans] = useState([])
  const [mySubscriptions, setMySubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedOrgType, setSelectedOrgType] = useState('all')
  const [selectedCycle, setSelectedCycle] = useState('monthly')

  // Subscribe Modal
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [subscribing, setSubscribing] = useState(false)
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)
  const [subscribeForm, setSubscribeForm] = useState({
    org_name: '',
    premises_address: user?.address || '',
    contact_phone: user?.phone || '',
  })

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const plansRes = await getSubscriptionPlans()
      setPlans(Array.isArray(plansRes) ? plansRes : (plansRes.plans || []))

      if (user) {
        try {
          const myRes = await getMySubscriptions()
          setMySubscriptions(myRes.subscriptions || [])
        } catch (e) {
          // Non-critical if user subscriptions fail
        }
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to load subscription plans.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  function handleOpenSubscribe(plan) {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/subscriptions' } } })
      return
    }
    setSelectedPlan(plan)
    setSubscribeSuccess(false)
    setSubscribeForm({
      org_name: '',
      premises_address: user.address || '',
      contact_phone: user.phone || '',
    })
  }

  async function handleConfirmSubscribe(e) {
    e.preventDefault()
    if (!selectedPlan) return

    if (!subscribeForm.org_name.trim() || !subscribeForm.premises_address.trim()) {
      alert('Please fill in your organization name and premises address.')
      return
    }

    setSubscribing(true)
    try {
      const payload = {
        plan_id: selectedPlan.id,
        org_name: subscribeForm.org_name.trim(),
        org_type: selectedPlan.org_type,
        billing_cycle: selectedPlan.billing_cycle,
        address: subscribeForm.premises_address.trim(),
        phone: subscribeForm.contact_phone.trim(),
      }

      const res = await createSubscription(payload)
      setSubscribeSuccess(true)
      if (res.subscription) {
        setMySubscriptions((prev) => [res.subscription, ...prev])
      }
      setTimeout(() => {
        setSelectedPlan(null)
        setSubscribeSuccess(false)
      }, 1800)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to activate subscription.')
    } finally {
      setSubscribing(false)
    }
  }

  async function handleCancelAutoRenew(subId) {
    if (!window.confirm('Are you sure you want to cancel auto-renew? Your plan remains active until the end of the billing period.')) {
      return
    }
    try {
      await cancelSubscription(subId)
      setMySubscriptions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, auto_renew: false } : s))
      )
      alert('Auto-renew cancelled. Subscription will expire at period end.')
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to cancel auto-renew.')
    }
  }

  function normalizeOrgType(type) {
    if (!type) return ''
    const t = String(type).toLowerCase()
    if (t.includes('pg') || t.includes('hostel')) return 'pg_hostel'
    if (t.includes('office') || t.includes('corporate') || t.includes('workspace')) return 'offices'
    if (t.includes('industr') || t.includes('factor')) return 'industries'
    return t.replace(/\s+/g, '_')
  }

  const formatExpiry = (dt) => {
    if (!dt) return 'Active'
    try {
      const d = new Date(dt)
      return isNaN(d.getTime()) ? String(dt).split('T')[0] : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return String(dt).split('T')[0]
    }
  }

  // Filter plans according to tab and billing cycle
  const filteredPlans = plans.filter((p) => {
    const matchesOrg = selectedOrgType === 'all' || normalizeOrgType(p.org_type) === selectedOrgType
    const matchesCycle = String(p.billing_cycle || '').toLowerCase() === selectedCycle.toLowerCase()
    return matchesOrg && matchesCycle
  })

  return (
    <div className="w-full bg-surface text-on-surface pb-20">
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-surface-container-low px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-surface-container-high">
        <div className="pointer-events-none absolute -right-16 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 -bottom-20 h-64 w-64 rounded-full bg-secondary-container/10 blur-2xl" />

        <div className="relative z-10 container-page text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary">
            <Building2 size={14} />
            <span>COOPERATIVE INSTITUTIONAL RETAINERS</span>
          </div>
          <h1 className="font-headline-xl text-3xl sm:text-5xl font-extrabold text-on-surface tracking-tight max-w-3xl mx-auto leading-tight">
            Predictable Maintenance Retainers for Facilities &amp; Businesses
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Eliminate frantic breakdown emergencies. Get a dedicated cooperative trade guild team assigned to your premises with guaranteed response SLAs, preventative inspections, and transparent democratic billing.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-surface-container-high/70 p-1.5 rounded-2xl border border-outline-variant/60 flex items-center gap-1 shadow-inner">
              {BILLING_CYCLES.map((cycle) => (
                <button
                  key={cycle.id}
                  type="button"
                  onClick={() => setSelectedCycle(cycle.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedCycle === cycle.id
                      ? 'bg-primary text-white shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span>{cycle.label}</span>
                  {cycle.discount && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-black transition-all ${
                        cycle.discount === 'Most Popular'
                          ? 'bg-amber-300 text-amber-950 border border-amber-400 shadow-xs'
                          : selectedCycle === cycle.id
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {cycle.discount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Active User Subscriptions (If Logged In & Has Any) ──────────── */}
      {mySubscriptions.length > 0 && (
        <section className="container-page pt-8">
          <div className="bg-gradient-to-r from-emerald-900/90 to-primary text-white rounded-3xl p-6 shadow-xl border border-emerald-400/30">
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldCheck size={22} className="text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Your Active Organization Retainer</h3>
                  <p className="text-xs text-emerald-100">Cooperative Guild on Standby for your facility</p>
                </div>
              </div>
              <span className="bg-emerald-400 text-emerald-950 text-xs font-black uppercase px-3 py-1 rounded-full shadow-xs">
                Active Retainer
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
              {mySubscriptions.map((sub) => (
                <div key={sub.id} className="bg-white/10 rounded-2xl p-4 border border-white/15 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-white">{sub.org_name}</span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200 uppercase">
                      {sub.billing_cycle}
                    </span>
                  </div>
                  <p className="text-slate-200">
                    Plan: <strong className="text-white">{sub.plan_name || (sub.org_type ? String(sub.org_type).replace(/_/g, ' ').toUpperCase() : 'ORGANIZATION')}</strong>
                  </p>
                  <p className="text-slate-200">
                    Rate: <strong className="text-white font-mono">₹{Number(sub.price || 0).toLocaleString('en-IN')}</strong> / {sub.billing_cycle}
                  </p>
                  <div className="text-[11px] text-emerald-200 pt-1 border-t border-white/10 flex justify-between items-center">
                    <span>Valid until: <strong>{formatExpiry(sub.expiry_date)}</strong></span>
                    {sub.auto_renew ? (
                      <button
                        type="button"
                        onClick={() => handleCancelAutoRenew(sub.id)}
                        className="text-[10px] text-red-200 hover:text-white underline font-semibold"
                      >
                        Cancel Auto-Renew
                      </button>
                    ) : (
                      <span className="text-[10px] text-amber-200">Expires at period end</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Main Filter & Catalog Section ──────────────────────────────── */}
      <section className="container-page pt-10 space-y-8">
        {/* Org Type Selector Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {ORG_TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedOrgType(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                  selectedOrgType === tab.id
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-xs flex items-center gap-2 max-w-lg mx-auto">
            <AlertCircle size={16} className="text-error shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Plans Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-surface-container rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-surface-container-high space-y-3">
            <Building2 size={36} className="mx-auto text-on-surface-variant" />
            <h3 className="font-bold text-on-surface text-base">No Plans Found for This Filter</h3>
            <p className="text-xs text-on-surface-variant">
              Please select a different organization type or billing cycle above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const isPopular = String(plan.billing_cycle).toLowerCase() === 'monthly' && normalizeOrgType(plan.org_type) === 'offices'
              const featuresList = Array.isArray(plan.features)
                ? plan.features
                : typeof plan.features === 'string'
                ? plan.features.split('\n').map((f) => f.trim()).filter(Boolean)
                : []

              return (
                <div
                  key={plan.id}
                  className={`bg-surface-container-lowest rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between relative shadow-sm hover:shadow-xl ${
                    isPopular
                      ? 'border-2 border-primary shadow-primary/10'
                      : 'border-surface-container-high hover:border-primary/40'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 border border-amber-500/50 text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                      ★ Most Popular Institutional Choice
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Badge & Name */}
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                        {String(plan.org_type || 'Facility').replace(/_/g, ' ')}
                      </span>
                      <h3 className="font-headline-md text-xl font-bold text-on-surface mt-2">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price Tag */}
                    <div className="pt-2 pb-3 border-y border-outline-variant/40">
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-3xl font-black text-on-surface">
                          ₹{Number(plan.price || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          /{plan.billing_cycle}
                        </span>
                      </div>
                      <span className="text-[11px] text-secondary font-semibold mt-0.5 block">
                        Direct Democratic Split • Zero Surge Pricing Guaranteed
                      </span>
                    </div>

                    {/* Feature Checkmarks */}
                    <div className="space-y-2.5 pt-1">
                      <span className="font-label-caps text-[10px] uppercase font-bold text-on-surface-variant block">
                        Included Cooperative Benefits:
                      </span>
                      {featuresList.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-on-surface">
                          <CheckCircle2 size={15} className="text-primary shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subscribe CTA */}
                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => handleOpenSubscribe(plan)}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 ${
                        isPopular
                          ? 'bg-primary hover:bg-primary-container text-white'
                          : 'bg-surface-container-high hover:bg-primary hover:text-white text-on-surface'
                      }`}
                    >
                      <Zap size={14} />
                      <span>Subscribe ({plan.billing_cycle})</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Institutional Value Proposition Feature Matrix ─────────────── */}
        <div className="mt-16 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/50 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h4 className="font-bold text-sm text-on-surface">Guaranteed Response SLA</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Subscribed facilities receive high-priority automated dispatch with guaranteed on-site technician arrival under 30 minutes for urgent issues.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-bold text-sm text-on-surface">Preventative Health Audits</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Routine bi-weekly electrical load checks, water pump vibration monitoring, and HVAC filter sanitization to prevent costly system failures.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users size={20} />
            </div>
            <h4 className="font-bold text-sm text-on-surface">Dedicated Guild Artisans</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              The same trusted, background-checked cooperative members visit your property each time, familiar with your cabling, valves, and layout.
            </p>
          </div>
        </div>
      </section>

      {/* ── Subscribe Modal ─────────────────────────────────────────────── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-outline-variant space-y-5 relative">
            <button
              onClick={() => setSelectedPlan(null)}
              disabled={subscribing}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            {subscribeSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-headline-md text-xl text-on-surface font-bold">
                  Retainer Activated!
                </h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Your organization plan has been activated. A representative from the local Sector Guild has been assigned to your facility.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmSubscribe} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-primary">
                      Activate Institutional Retainer
                    </span>
                    <h3 className="font-bold text-lg text-on-surface">{selectedPlan.name}</h3>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-on-surface-variant block">Billing Rate</span>
                    <span className="font-mono text-base font-black text-primary">
                      ₹{selectedPlan.price}
                    </span>
                    <span className="text-[10px] text-on-surface-variant"> /{selectedPlan.billing_cycle}</span>
                  </div>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                    {String(selectedPlan.org_type || 'Facility').replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface block">Organization / Facility Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Girls PG / Innov8 Coworking Hub / Sector 63 Packaging Ltd"
                      value={subscribeForm.org_name}
                      onChange={(e) => setSubscribeForm({ ...subscribeForm, org_name: e.target.value })}
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface block">Premises Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Building, Sector, Street address in Noida/NCR"
                      value={subscribeForm.premises_address}
                      onChange={(e) => setSubscribeForm({ ...subscribeForm, premises_address: e.target.value })}
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-on-surface block">Primary Facility Manager Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={subscribeForm.contact_phone}
                      onChange={(e) => setSubscribeForm({ ...subscribeForm, contact_phone: e.target.value })}
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2 text-xs font-mono font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-on-surface-variant leading-relaxed pt-1">
                  By confirming, your organization will be registered under the NEED Cooperative Federation Institutional Roster. You may cancel auto-renewal anytime from your dashboard.
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    disabled={subscribing}
                    className="flex-1 py-2.5 rounded-xl border border-outline-variant font-bold text-xs text-on-surface hover:bg-surface-container transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Activating Retainer…</span>
                      </>
                    ) : (
                      <span>Confirm &amp; Subscribe (₹{selectedPlan.price})</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
