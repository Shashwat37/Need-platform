/**
 * AdminRevenueTab.jsx — Executive Revenue Command & Lead Economics for NEED Federation.
 * Displays real-time metrics for Lead Unlocks, Organization Subscriptions, Convenience Fees,
 * Customer Protection Fees, editable Lead Pricing schedules, and Society Verification governance.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  ExternalLink,
  Factory,
  FileCheck,
  Filter,
  HeartHandshake,
  Home,
  IndianRupee,
  Layers,
  Loader2,
  Lock,
  PieChart,
  RefreshCw,
  Save,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Unlock,
  UserCheck,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import {
  getAdminRevenue,
  getAdminLeadPricing,
  updateAdminLeadPricing,
  getCooperatives,
  verifyCooperative,
} from '../services/api'

export default function AdminRevenueTab() {
  const [data, setData] = useState(null)
  const [cooperatives, setCooperatives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Sub-tabs within Revenue tab
  const [subTab, setSubTab] = useState('overview') // 'overview' | 'pricing' | 'subscriptions' | 'societies' | 'ledger'

  // Lead pricing edit modal
  const [editingPricing, setEditingPricing] = useState(null)
  const [editPriceVal, setEditPriceVal] = useState(25)
  const [savingPrice, setSavingPrice] = useState(false)

  // Cooperative verify action loading
  const [verifyingCoopId, setVerifyingCoopId] = useState(null)

  async function loadRevenueData(showLoading = true) {
    if (showLoading) setLoading(true)
    setError('')
    try {
      const [revRes, coopRes] = await Promise.all([
        getAdminRevenue(),
        getCooperatives(),
      ])
      setData(revRes)
      setCooperatives(coopRes || [])
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to fetch federation revenue telemetry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRevenueData()
  }, [])

  async function handleSavePricing(e) {
    e.preventDefault()
    if (!editingPricing) return
    const priceNum = Number(editPriceVal)
    if (isNaN(priceNum) || priceNum < 5 || priceNum > 150) {
      alert('Please enter a reasonable lead price between ₹5 and ₹150.')
      return
    }

    setSavingPrice(true)
    try {
      await updateAdminLeadPricing({
        category: editingPricing.category,
        job_type: editingPricing.job_type,
        lead_price: priceNum,
        min_job_value: editingPricing.min_job_value || 199,
      })
      alert(`Lead price for ${editingPricing.category} updated to ₹${priceNum}!`)
      setEditingPricing(null)
      loadRevenueData(false)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update lead pricing.')
    } finally {
      setSavingPrice(false)
    }
  }

  async function handleUpdateCoopStatus(coopId, status) {
    setVerifyingCoopId(coopId)
    try {
      await verifyCooperative(coopId, status, `Status changed to ${status} by Federation Administrator`)
      setCooperatives((prev) =>
        prev.map((c) => (c.id === coopId ? { ...c, verification_status: status } : c))
      )
      alert(`Cooperative status updated to "${status.toUpperCase()}".`)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update society verification status.')
    } finally {
      setVerifyingCoopId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-surface-container rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-surface-container-high rounded-3xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-surface-container-lowest rounded-3xl border border-red-200 text-red-700">
        <AlertCircle size={36} className="mx-auto mb-2 text-red-500" />
        <h3 className="font-bold text-base">Failed to Load Revenue Intelligence</h3>
        <p className="text-xs mt-1 text-on-surface-variant max-w-sm mx-auto">{error}</p>
        <button onClick={() => loadRevenueData()} className="btn btn-primary mt-4 text-xs">
          Retry Telemetry
        </button>
      </div>
    )
  }

  const summary = data?.summary || {}
  const total_revenue = summary.total_revenue ?? data?.total_revenue ?? 0
  const lead_revenue = summary.job_lead_revenue ?? summary.lead_revenue ?? data?.lead_revenue ?? 0
  const subscription_revenue = summary.subscription_revenue ?? data?.subscription_revenue ?? 0
  const convenience_fee_revenue = summary.convenience_fee_revenue ?? data?.convenience_fee_revenue ?? 0
  const protection_fee_revenue = summary.protection_fee_revenue ?? data?.protection_fee_revenue ?? 0
  const platform_fee_revenue = summary.platform_fee_revenue ?? data?.platform_fee_revenue ?? 0

  const by_source = data?.by_source || [
    { source_type: 'subscription', amount: subscription_revenue },
    { source_type: 'lead_unlock', amount: lead_revenue },
    { source_type: 'convenience_fee', amount: convenience_fee_revenue },
    { source_type: 'protection_fee', amount: protection_fee_revenue },
    { source_type: 'platform_fee', amount: platform_fee_revenue },
  ]
  const by_service = data?.revenue_by_service || data?.by_service || []
  const by_org_type = data?.revenue_by_org_type || data?.by_org_type || []
  const recent_records = data?.recent_transactions || data?.recent_records || []
  const active_subscriptions = data?.active_subscriptions || []
  const lead_pricing = data?.lead_pricings || data?.lead_pricing || []

  const sourceLabels = {
    lead_unlock: 'Job Lead Unlocks',
    subscription: 'Org Subscriptions',
    convenience_fee: 'Compulsory Convenience Fees',
    protection_fee: 'Customer Protection Fees',
    platform_fee: 'Cooperative Ops Reserve',
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Top 5 Revenue KPI Cards ─────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Gross Platform Revenue */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-caps text-xs uppercase font-bold text-on-surface-variant">
              Total Platform Revenue
            </span>
            <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <IndianRupee size={16} />
            </span>
          </div>
          <div>
            <div className="font-metric-val text-2xl sm:text-3xl font-black text-on-surface">
              ₹{total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 mt-1 text-primary font-bold text-xs">
              <TrendingUp size={13} />
              <span>All Inflows Combined</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Lead Unlocks */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-caps text-xs uppercase font-bold text-on-surface-variant">
              Worker Lead Credits
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Unlock size={16} />
            </span>
          </div>
          <div>
            <div className="font-metric-val text-2xl sm:text-3xl font-black text-emerald-800">
              ₹{lead_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block font-medium">
              ₹10–₹35 per verified dispatch
            </span>
          </div>
        </div>

        {/* KPI 3: Org Subscriptions */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-caps text-xs uppercase font-bold text-on-surface-variant">
              Org Retainers
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
              <Building2 size={16} />
            </span>
          </div>
          <div>
            <div className="font-metric-val text-2xl sm:text-3xl font-black text-blue-900">
              ₹{subscription_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block font-medium">
              {active_subscriptions.length} active institutional plans
            </span>
          </div>
        </div>

        {/* KPI 4: Compulsory Convenience Fee */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-caps text-xs uppercase font-bold text-on-surface-variant">
              Convenience Fees
            </span>
            <span className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800">
              <Sparkles size={16} />
            </span>
          </div>
          <div>
            <div className="font-metric-val text-2xl sm:text-3xl font-black text-purple-900">
              ₹{convenience_fee_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block font-medium">
              ₹20 compulsory dispatch fee
            </span>
          </div>
        </div>

        {/* KPI 5: Customer Protection Fee */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-caps text-xs uppercase font-bold text-on-surface-variant">
              Protection Pool
            </span>
            <span className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800">
              <ShieldCheck size={16} />
            </span>
          </div>
          <div>
            <div className="font-metric-val text-2xl sm:text-3xl font-black text-teal-900">
              ₹{protection_fee_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block font-medium">
              Warranty &amp; damage reserve (≤ ₹50)
            </span>
          </div>
        </div>
      </section>

      {/* ── Sub Navigation Controls ────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-surface-container-high pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'overview', label: 'Revenue Overview & Mix', icon: PieChart },
            { id: 'pricing', label: 'Lead Pricing Schedule', icon: Unlock },
            { id: 'subscriptions', label: 'Active Retainers', icon: Building2 },
            { id: 'societies', label: 'Society Verification Badges', icon: ShieldCheck },
            { id: 'ledger', label: 'Unified Audit Ledger', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  subTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => loadRevenueData(false)}
          className="text-xs text-on-surface-variant hover:text-primary transition flex items-center gap-1 font-semibold"
        >
          <RefreshCw size={13} />
          <span>Refresh Live Data</span>
        </button>
      </div>

      {/* ── SUB-TAB 1: REVENUE OVERVIEW & MIX ─────────────────────────── */}
      {subTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue By Source Type */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
                <PieChart size={18} className="text-primary" />
                Revenue Breakdown by Source
              </h3>
              <span className="font-mono text-xs font-bold text-primary">₹{total_revenue} Total</span>
            </div>

            <div className="space-y-3 pt-2">
              {by_source.map((item) => {
                const pct = total_revenue > 0 ? Math.round((item.amount / total_revenue) * 100) : 0
                return (
                  <div key={item.source_type} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-on-surface">
                        {sourceLabels[item.source_type] || item.source_type}
                      </span>
                      <span className="font-mono font-bold text-on-surface">
                        ₹{item.amount.toLocaleString('en-IN')} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Revenue by Service Category */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
                <Wrench size={18} className="text-secondary" />
                Top Performing Trade Categories
              </h3>
              <span className="text-xs text-on-surface-variant font-medium">By Booking &amp; Lead Inflow</span>
            </div>

            <div className="space-y-3 pt-2">
              {by_service.length === 0 ? (
                <p className="text-xs text-on-surface-variant">No category records found.</p>
              ) : (
                by_service.map((item) => (
                  <div key={item.category} className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {item.category[0]}
                      </div>
                      <span className="font-bold text-on-surface">{item.category}</span>
                    </div>
                    <span className="font-mono font-black text-primary text-sm">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: LEAD PRICING SCHEDULE (CONFIGURABLE) ───────────── */}
      {subTab === 'pricing' && (
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
                <Unlock size={20} className="text-primary" />
                Configured Job Lead Prices by Service Category
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Workers unlock customer contact details with credits based on these federation rates (₹10–₹35 standard).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-container-high text-[11px] font-mono uppercase font-bold text-on-surface-variant">
                  <th className="py-3 px-4">Service Category</th>
                  <th className="py-3 px-4">Job Type</th>
                  <th className="py-3 px-4">Min Job Value</th>
                  <th className="py-3 px-4">Configured Lead Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-medium">
                {lead_pricing.map((lp) => (
                  <tr key={lp.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-bold text-on-surface">{lp.category}</td>
                    <td className="py-3 px-4 text-on-surface-variant font-mono">{lp.job_type}</td>
                    <td className="py-3 px-4 font-mono">₹{lp.min_job_value}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-black text-primary text-sm bg-primary/10 px-2.5 py-1 rounded-lg">
                        ₹{lp.lead_price}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPricing(lp)
                          setEditPriceVal(lp.lead_price)
                        }}
                        className="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-primary hover:text-white transition font-bold text-xs inline-flex items-center gap-1 shadow-xs"
                      >
                        <Edit2 size={12} />
                        <span>Edit Rate</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: ACTIVE ORGANIZATIONAL RETAINERS ────────────────── */}
      {subTab === 'subscriptions' && (
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                Active Institutional Subscriptions (PG/Hostels, Offices, Industries)
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Organizations paying recurring retainer fees for dedicated cooperative artisan coverage.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {active_subscriptions.length} Subscriptions Active
            </span>
          </div>

          <div className="overflow-x-auto pt-2">
            {active_subscriptions.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-8 text-center">No active organization retainers.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-surface-container-high text-[11px] font-mono uppercase font-bold text-on-surface-variant">
                    <th className="py-3 px-4">Organization Name</th>
                    <th className="py-3 px-4">Plan &amp; Facility Type</th>
                    <th className="py-3 px-4">Billing Cycle</th>
                    <th className="py-3 px-4">Retainer Price</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Auto Renew</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-medium">
                  {active_subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-bold text-on-surface">{sub.org_name}</td>
                      <td className="py-3 px-4">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                          {sub.org_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono uppercase">{sub.billing_cycle}</td>
                      <td className="py-3 px-4 font-mono font-bold text-primary">₹{sub.price}</td>
                      <td className="py-3 px-4 font-mono text-on-surface-variant">{sub.expiry_date}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.auto_renew ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                          {sub.auto_renew ? 'Yes (Recurring)' : 'No (Ending)'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 4: SOCIETY VERIFICATION BADGE GOVERNANCE ──────────── */}
      {subTab === 'societies' && (
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high shadow-sm space-y-4">
          <div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600" />
              Cooperative Society Trust Verification Governance
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Only verified societies display the prestigious "Society Verified Community" trust badge on customer listings.
            </p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-container-high text-[11px] font-mono uppercase font-bold text-on-surface-variant">
                  <th className="py-3 px-4">Society Name</th>
                  <th className="py-3 px-4">Registration #</th>
                  <th className="py-3 px-4">City / Area</th>
                  <th className="py-3 px-4">Current Badge Status</th>
                  <th className="py-3 px-4 text-right">Federation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-medium">
                {cooperatives.map((coop) => (
                  <tr key={coop.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-bold text-on-surface">{coop.name}</td>
                    <td className="py-3 px-4 font-mono text-on-surface-variant">{coop.registration_number || 'COOP-UP-2022'}</td>
                    <td className="py-3 px-4">{coop.city || 'Noida'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                        coop.verification_status === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : coop.verification_status === 'pending'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        <ShieldCheck size={12} />
                        {coop.verification_status === 'suspended' ? 'Suspended' : coop.verification_status === 'pending' ? 'Pending Review' : 'Society Verified Community'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateCoopStatus(coop.id, 'verified')}
                          disabled={verifyingCoopId === coop.id || coop.verification_status === 'verified'}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition disabled:opacity-40"
                        >
                          Verify ✅
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCoopStatus(coop.id, 'pending')}
                          disabled={verifyingCoopId === coop.id || coop.verification_status === 'pending'}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition disabled:opacity-40"
                        >
                          Pending ⏳
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCoopStatus(coop.id, 'suspended')}
                          disabled={verifyingCoopId === coop.id || coop.verification_status === 'suspended'}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] transition disabled:opacity-40"
                        >
                          Suspend 🚫
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 5: UNIFIED AUDIT LEDGER ────────────────────────────── */}
      {subTab === 'ledger' && (
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
                <Layers size={20} className="text-primary" />
                Federation Revenue Inflow Audit Ledger
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Cryptographically tracked transaction journal under Cooperative Audit Bylaw #9.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-primary">
              {recent_records.length} Recent Records
            </span>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-container-high text-[11px] font-mono uppercase font-bold text-on-surface-variant">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Source Channel</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-medium">
                {recent_records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-on-surface-variant">No ledger entries yet.</td>
                  </tr>
                ) : (
                  recent_records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-mono text-on-surface-variant whitespace-nowrap">{rec.created_at}</td>
                      <td className="py-3 px-4">
                        <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] uppercase font-bold text-on-surface">
                          {sourceLabels[rec.source_type] || rec.source_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-primary">₹{rec.amount}</td>
                      <td className="py-3 px-4 font-mono text-on-surface-variant">#{rec.reference_id || 'N/A'}</td>
                      <td className="py-3 px-4 text-on-surface-variant truncate max-w-xs">{rec.description}</td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-800 bg-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {rec.status || 'settled'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Edit Lead Price Modal ─────────────────────────────────────── */}
      {editingPricing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-on-surface">
                Configure Lead Price: {editingPricing.category}
              </h3>
              <button
                onClick={() => setEditingPricing(null)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface block">
                  Lead Unlock Price (₹) *
                </label>
                <input
                  type="number"
                  min="5"
                  max="150"
                  required
                  value={editPriceVal}
                  onChange={(e) => setEditPriceVal(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2.5 text-sm font-mono font-bold text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
                <span className="text-[10px] text-on-surface-variant">
                  Recommended range: ₹10 – ₹35 based on job value.
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-container-low text-xs text-on-surface-variant space-y-1">
                <div>Category: <strong className="text-on-surface">{editingPricing.category}</strong></div>
                <div>Job Type: <strong className="text-on-surface">{editingPricing.job_type}</strong></div>
                <div>Min Job Value: <strong className="text-on-surface font-mono">₹{editingPricing.min_job_value}</strong></div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPricing(null)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant font-bold text-xs text-on-surface hover:bg-surface-container transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPrice}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5"
                >
                  {savingPrice ? <span>Saving...</span> : <span>Save Lead Price</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
