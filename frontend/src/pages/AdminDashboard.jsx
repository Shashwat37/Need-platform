/**
 * AdminDashboard.jsx — the Cooperative Federation administrative console.
 *
 * WHAT: Executive dashboard for platform management, worker verification approval,
 *       booking oversight, welfare fund ledger, and support dispute handling.
 *
 * WHY:  On NEED, the cooperative federation governs the platform transparently,
 *       ensuring service standards through worker verification and safeguarding
 *       the collective welfare fund.
 *
 * HOW:  Loads platform data from GET /api/admin/dashboard. Provides interactive
 *       one-click actions to verify/reject workers and resolve support tickets.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  Filter,
  HeartHandshake,
  HelpCircle,
  IndianRupee,
  LifeBuoy,
  Loader2,
  Lock,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getAdminDashboard,
  getAdminWelfareRequests,
  getDemandForecasting,
  handleWelfareRequestAction,
  updateTicketStatus,
  verifyWorker,
} from '../services/api'
import SectionHeading from '../components/SectionHeading'

// ---------------------------------------------------------------------------
// Status styles & labels
// ---------------------------------------------------------------------------
const VERIFICATION_STYLES = {
  verified: 'bg-verified/10 text-verified border-verified/30',
  pending:  'bg-pending/10 text-pending border-pending/30',
  rejected: 'bg-rejected/10 text-rejected border-rejected/30',
}

const TICKET_STYLES = {
  open:        'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved:    'bg-green-50 text-green-700 border-green-200',
}

const BOOKING_STYLES = {
  pending:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted:    'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-brand-50 text-brand-700 border-brand-100',
  completed:   'bg-green-50 text-green-700 border-green-200',
  cancelled:   'bg-gray-100 text-gray-500 border-gray-200',
  rejected:    'bg-red-50 text-red-700 border-red-200',
}

// ---------------------------------------------------------------------------
// Stat KPI Card
// ---------------------------------------------------------------------------
function KpiCard({ label, value, subtext, icon: Icon, colour, badge }) {
  return (
    <div className="card flex flex-col justify-between p-5 transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
            {badge && (
              <span className="rounded-full bg-pending/10 px-2 py-0.5 text-[10px] font-bold text-pending">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1.5 font-mono text-2xl font-bold text-ink">{value}</p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${colour}`}>
          <Icon size={20} />
        </span>
      </div>
      {subtext && (
        <p className="mt-3 border-t border-line/60 pt-2.5 text-xs text-muted">
          {subtext}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton Loading
// ---------------------------------------------------------------------------
function AdminSkeleton() {
  return (
    <div className="container-page py-10 space-y-8">
      <div className="h-10 w-72 animate-pulse rounded-xl bg-line" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-line" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-line" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Admin Dashboard Component
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('workers') // 'workers' | 'bookings' | 'welfare' | 'tickets'

  // Workers search & filter state
  const [workerFilter, setWorkerFilter] = useState('all') // 'all' | 'pending' | 'verified' | 'rejected'
  const [workerSearch, setWorkerSearch] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  function loadData() {
    setLoading(true)
    setError('')
    getAdminDashboard()
      .then(setData)
      .catch(err => {
        setError(err?.response?.data?.error || 'Could not load federation dashboard.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [])

  // Action: Verify or Reject Worker
  async function handleVerify(workerId, newStatus) {
    setActionLoadingId(workerId)
    try {
      const res = await verifyWorker(workerId, newStatus)
      // Update local state instantly
      setData(prev => {
        const updatedWorkers = prev.workers.map(w => {
          if (w.user_id === workerId) {
            return {
              ...w,
              verification_status: newStatus,
              is_available: newStatus === 'verified',
            }
          }
          return w
        })

        // Recalculate counts
        const verified_workers = updatedWorkers.filter(w => w.verification_status === 'verified').length
        const pending_workers  = updatedWorkers.filter(w => w.verification_status === 'pending').length
        const rejected_workers = updatedWorkers.filter(w => w.verification_status === 'rejected').length

        return {
          ...prev,
          workers: updatedWorkers,
          stats: {
            ...prev.stats,
            verified_workers,
            pending_workers,
            rejected_workers,
          }
        }
      })

      setActionNotice({
        type: 'success',
        message: `Worker verification status changed to "${newStatus.toUpperCase()}".`
      })
      setTimeout(() => setActionNotice(null), 4000)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update verification status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const [welfareRequests, setWelfareRequests] = useState([])
  const [forecastingData, setForecastingData] = useState(null)

  // Fetch emergency welfare requests
  function fetchWelfareRequests() {
    getAdminWelfareRequests()
      .then(res => setWelfareRequests(res.requests || []))
      .catch(() => {})
  }

  // Fetch forecasting data
  function fetchForecasting() {
    getDemandForecasting()
      .then(res => setForecastingData(res))
      .catch(() => {})
  }

  useEffect(() => {
    if (activeTab === 'welfare') {
      fetchWelfareRequests()
    } else if (activeTab === 'forecasting') {
      fetchForecasting()
    }
  }, [activeTab])

  // Action: Approve or Reject Welfare Request
  async function handleWelfareAction(requestId, status) {
    let notes = ''
    if (status === 'rejected') {
      const input = window.prompt('Specify reason for rejecting emergency withdrawal request (optional):')
      if (input === null) return
      notes = input
    }

    setActionLoadingId(`welfare-${requestId}`)
    try {
      await handleWelfareRequestAction(requestId, status, notes)
      setActionNotice({
        type: 'success',
        message: `Welfare withdrawal request #${requestId} ${status} successfully.`
      })
      setTimeout(() => setActionNotice(null), 4000)
      fetchWelfareRequests()
      loadData(false)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update welfare request status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Action: Update Support Ticket Status with Resolution Response
  async function handleTicketStatus(ticketId, newStatus) {
    let responseText = ''
    if (['in_progress', 'resolved'].includes(newStatus)) {
      const input = window.prompt(`Enter resolution response for ticket #${ticketId} (optional):`)
      if (input === null) return
      responseText = input
    }

    setActionLoadingId(`ticket-${ticketId}`)
    try {
      const res = await updateTicketStatus(ticketId, newStatus, responseText)
      setData(prev => ({
        ...prev,
        tickets: prev.tickets.map(t => t.id === ticketId ? { ...t, status: newStatus, admin_response: res.ticket?.admin_response || responseText } : t)
      }))
      setActionNotice({
        type: 'success',
        message: `Support ticket #${ticketId} marked as ${newStatus.toUpperCase()}.`
      })
      setTimeout(() => setActionNotice(null), 4000)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update ticket status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  if (loading) return <AdminSkeleton />

  if (error) {
    return (
      <div className="container-page py-24 text-center">
        <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
        <p className="mb-6 text-muted">{error}</p>
        <button onClick={loadData} className="btn btn-primary">
          Retry
        </button>
      </div>
    )
  }

  const { stats, workers, recent_bookings, tickets } = data

  // Filtered workers list
  const filteredWorkers = workers.filter(w => {
    const matchesFilter = workerFilter === 'all' || w.verification_status === workerFilter
    const term = workerSearch.toLowerCase()
    const matchesSearch =
      !term ||
      w.name.toLowerCase().includes(term) ||
      (w.primary_service && w.primary_service.toLowerCase().includes(term)) ||
      (w.city && w.city.toLowerCase().includes(term)) ||
      (w.skills && w.skills.toLowerCase().includes(term))
    return matchesFilter && matchesSearch
  })

  return (
    <div className="container-page py-10 space-y-8">

      {/* ── Executive Header ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-extrabold text-ink">
              Cooperative Federation Admin
            </h1>
            <span className="rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              Federation Console
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Platform governance, worker credential verification, and social security ledger.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn btn-outline flex items-center gap-2"
          title="Refresh live data"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="flex items-center justify-between rounded-xl border border-verified/30 bg-verified/10 px-4 py-3 text-sm text-ink animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-verified" />
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-muted hover:text-ink">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── 5 KPI Metric Cards ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Verified Workers"
          value={stats.verified_workers}
          subtext={`${stats.total_workers} total registered`}
          icon={UserCheck}
          colour="bg-emerald-50 text-emerald-700"
        />
        <KpiCard
          label="Pending Approvals"
          value={stats.pending_workers}
          subtext={stats.pending_workers > 0 ? "Requires document review" : "All reviewed"}
          icon={Shield}
          colour={stats.pending_workers > 0 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-700"}
          badge={stats.pending_workers > 0 ? `${stats.pending_workers} Action` : null}
        />
        <KpiCard
          label="Customers"
          value={stats.total_customers}
          subtext="Active households"
          icon={Users}
          colour="bg-blue-50 text-blue-700"
        />
        <KpiCard
          label="Welfare Fund"
          value={`₹${stats.welfare_total.toLocaleString('en-IN')}`}
          subtext={`₹${stats.welfare_balance.toLocaleString('en-IN')} active reserve`}
          icon={HeartHandshake}
          colour="bg-teal-50 text-teal-700"
        />
        <KpiCard
          label="Platform Bookings"
          value={stats.total_bookings}
          subtext={`${stats.total_services} active services`}
          icon={Briefcase}
          colour="bg-brand-50 text-brand-700"
        />
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="flex border-b border-line">
        <button
          onClick={() => setActiveTab('workers')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold transition ${
            activeTab === 'workers'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <FileCheck2 size={16} />
          Worker Verifications
          {stats.pending_workers > 0 && (
            <span className="rounded-full bg-pending px-2 py-0.5 text-[10px] font-bold text-white">
              {stats.pending_workers}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold transition ${
            activeTab === 'bookings'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Briefcase size={16} />
          Bookings Oversight
        </button>

        <button
          onClick={() => setActiveTab('welfare')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold transition ${
            activeTab === 'welfare'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <HeartHandshake size={16} />
          Welfare Social Security
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold transition ${
            activeTab === 'tickets'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <LifeBuoy size={16} />
          Support Desk
          {tickets.filter(t => t.status === 'open').length > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {tickets.filter(t => t.status === 'open').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('forecasting')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold transition ${
            activeTab === 'forecasting'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <TrendingUp size={16} />
          AI Demand Forecasting
        </button>
      </div>

      {/* ── TAB 1: WORKER DIRECTORY & VERIFICATION ──────────────────────── */}
      {activeTab === 'workers' && (
        <section className="space-y-4">
          {/* Controls: Filter chips + Search */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 rounded-xl border border-line bg-paper p-1">
              {[
                { key: 'all', label: `All (${workers.length})` },
                { key: 'pending', label: `Pending (${stats.pending_workers})` },
                { key: 'verified', label: `Verified (${stats.verified_workers})` },
                { key: 'rejected', label: `Rejected (${stats.rejected_workers})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setWorkerFilter(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    workerFilter === tab.key
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search worker, trade, city..."
                value={workerSearch}
                onChange={e => setWorkerSearch(e.target.value)}
                className="w-full rounded-xl border border-line bg-white py-2 pl-9 pr-4 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Workers Table */}
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-paper text-xs font-medium uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-5 py-3.5">Worker Name & Contact</th>
                    <th className="px-5 py-3.5">Trade & Skills</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5">Jobs / Rating</th>
                    <th className="px-5 py-3.5">Verification</th>
                    <th className="px-5 py-3.5 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted">
                        No workers match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map(w => {
                      const isPending = w.verification_status === 'pending'
                      const isVerified = w.verification_status === 'verified'
                      const isRejected = w.verification_status === 'rejected'
                      const isProcessing = actionLoadingId === w.user_id

                      return (
                        <tr key={w.user_id} className="hover:bg-paper/50">
                          {/* Name & ID */}
                          <td className="px-5 py-4">
                            <p className="font-semibold text-ink">{w.name}</p>
                            <p className="font-mono text-xs text-muted">
                              ID: #{w.user_id.toString().padStart(4, '0')} • {w.phone}
                            </p>
                            <p className="text-xs text-muted truncate max-w-[200px]">{w.email}</p>
                          </td>

                          {/* Trade & Certification */}
                          <td className="px-5 py-4">
                            <span className="inline-block font-semibold text-brand-700">
                              {w.primary_service}
                            </span>
                            <p className="text-xs text-muted truncate max-w-[180px]" title={w.skills || ''}>
                              {w.skills || 'General skilled'}
                            </p>
                            <p className="font-mono text-[11px] text-muted">
                              Exp: {w.experience_years}y • {w.certifications || 'Self-certified'}
                            </p>
                          </td>

                          {/* Location */}
                          <td className="px-5 py-4 text-xs text-muted">
                            <div className="flex items-center gap-1">
                              <MapPin size={13} className="shrink-0 text-muted" />
                              <span className="truncate max-w-[140px]">{w.city}</span>
                            </div>
                          </td>

                          {/* Stats */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 font-semibold text-ink text-xs">
                              <Star size={13} className="fill-marigold-500 text-marigold-500" />
                              {w.rating > 0 ? w.rating : 'New'}
                            </div>
                            <p className="text-xs text-muted">{w.total_jobs} jobs done</p>
                          </td>

                          {/* Verification Status */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                              VERIFICATION_STYLES[w.verification_status] || 'bg-gray-100 text-gray-700'
                            }`}>
                              {w.verification_status === 'verified' && <ShieldCheck size={13} />}
                              {w.verification_status === 'pending' && <Clock size={13} />}
                              {w.verification_status === 'rejected' && <ShieldAlert size={13} />}
                              {w.verification_status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            {isProcessing ? (
                              <Loader2 size={18} className="animate-spin text-brand-600 inline-block" />
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      onClick={() => handleVerify(w.user_id, 'verified')}
                                      className="flex items-center gap-1 rounded-lg bg-verified px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-verified/90 shadow-sm"
                                      title="Approve verification documents"
                                    >
                                      <Check size={13} />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleVerify(w.user_id, 'rejected')}
                                      className="flex items-center gap-1 rounded-lg border border-rejected/30 bg-rejected/10 px-2.5 py-1.5 text-xs font-semibold text-rejected transition hover:bg-rejected hover:text-white"
                                      title="Reject verification"
                                    >
                                      <X size={13} />
                                      Reject
                                    </button>
                                  </>
                                )}

                                {isRejected && (
                                  <button
                                    onClick={() => handleVerify(w.user_id, 'verified')}
                                    className="rounded-lg border border-brand-500 bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-600 hover:text-white"
                                  >
                                    Re-Approve
                                  </button>
                                )}

                                {isVerified && (
                                  <button
                                    onClick={() => handleVerify(w.user_id, 'rejected')}
                                    className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-rejected/10 hover:text-rejected"
                                    title="Revoke member verification"
                                  >
                                    Revoke
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── TAB 2: BOOKINGS OVERSIGHT ───────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Activity"
            title="Platform Bookings Oversight"
            description="Live service requests and completions across the cooperative marketplace."
          />

          <div className="card overflow-hidden p-0">
            {recent_bookings.length === 0 ? (
              <div className="py-16 text-center text-muted">
                <Briefcase size={36} className="mx-auto mb-3 text-muted/60" />
                <p className="font-semibold text-ink">No bookings logged yet</p>
                <p className="text-xs">Platform bookings will be tracked here in real-time once customers request services in Step 7.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-paper text-xs font-medium uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-3.5">Booking ID</th>
                      <th className="px-5 py-3.5">Service</th>
                      <th className="px-5 py-3.5">Schedule</th>
                      <th className="px-5 py-3.5">Assigned Worker</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {recent_bookings.map(b => (
                      <tr key={b.id} className="hover:bg-paper/50">
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-ink">
                          #BK-{b.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-5 py-4 font-medium text-ink">
                          {b.service_name}
                          {b.is_emergency && (
                            <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
                              Urgent
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-muted">
                          {b.scheduled_date ? `${b.scheduled_date} ${b.scheduled_time || ''}` : '—'}
                        </td>
                        <td className="px-5 py-4 text-xs text-muted">
                          {b.worker_name || 'Unassigned'}
                        </td>
                        <td className="px-5 py-4 font-mono font-semibold text-ink">
                          ₹{b.amount || 0}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            BOOKING_STYLES[b.status] || 'bg-gray-100 text-gray-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── TAB 3: WELFARE SOCIAL SECURITY LEDGER ──────────────────────── */}
      {activeTab === 'welfare' && (
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Cooperative Model"
            title="Welfare Fund Social Security Ledger"
            description="Unlike private gig apps that capture platform surplus, NEED pools 10% of job earnings directly into verified worker welfare wallets."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card p-6 border-l-4 border-l-brand-600">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Lifetime Welfare Generated</p>
              <p className="mt-2 font-mono text-3xl font-extrabold text-ink">
                ₹{stats.welfare_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-muted">Cumulative 10% welfare allocations</p>
            </div>

            <div className="card p-6 border-l-4 border-l-teal-600">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Active Liquid Reserve</p>
              <p className="mt-2 font-mono text-3xl font-extrabold text-teal-700">
                ₹{stats.welfare_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-muted">Available across worker wallets</p>
            </div>

            <div className="card p-6 border-l-4 border-l-emerald-600">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Insurance Reserve Pool</p>
              <p className="mt-2 font-mono text-3xl font-extrabold text-emerald-700">
                ₹{stats.insurance_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-muted">Dedicated accident & emergency pool</p>
            </div>
          </div>

          {/* Emergency Cash Withdrawal Requests Review Panel */}
          <div className="card p-6 space-y-4">
            <h3 className="font-display font-bold text-ink text-base">
              Emergency Welfare Withdrawal Requests
            </h3>
            {welfareRequests.length === 0 ? (
              <p className="text-xs text-muted">No emergency withdrawal requests submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="border-b border-line bg-paper text-muted font-medium">
                    <tr>
                      <th className="px-4 py-2.5">Worker</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">Reason</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Federation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {welfareRequests.map(r => {
                      const isActing = actionLoadingId === `welfare-${r.id}`
                      return (
                        <tr key={r.id} className="hover:bg-paper/40">
                          <td className="px-4 py-3 font-semibold text-ink">{r.worker_name}</td>
                          <td className="px-4 py-3 font-mono font-bold text-brand-700">₹{r.amount}</td>
                          <td className="px-4 py-3 text-muted max-w-[220px] truncate" title={r.reason}>{r.reason}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold capitalize ${
                              r.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                              r.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isActing ? (
                              <Loader2 size={16} className="animate-spin text-brand-600 inline-block" />
                            ) : r.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleWelfareAction(r.id, 'approved')}
                                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleWelfareAction(r.id, 'rejected')}
                                  className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-display font-bold text-ink text-base mb-4">
              Member Welfare Fund Balances
            </h3>
            <div className="divide-y divide-line">
              {workers.slice(0, 8).map(w => (
                <div key={w.user_id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-semibold text-ink">{w.name} ({w.primary_service})</p>
                    <p className="text-xs text-muted">Completed {w.total_jobs} cooperative jobs</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-brand-700">
                      ₹{w.welfare_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] text-muted">Wallet balance</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TAB 4: SUPPORT DESK ─────────────────────────────────────────── */}
      {activeTab === 'tickets' && (
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Help & Disputes"
            title="Cooperative Support Desk"
            description="Customer and worker inquiries, payment clarification, and dispute arbitration."
          />

          <div className="card overflow-hidden p-0">
            {tickets.length === 0 ? (
              <div className="py-16 text-center text-muted">
                <LifeBuoy size={36} className="mx-auto mb-3 text-muted/60" />
                <p className="font-semibold text-ink">No support tickets currently open</p>
                <p className="text-xs">User inquiries submitted through the Help Center will appear here for review in Step 12.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-paper text-xs font-medium uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-3.5">Ticket ID</th>
                      <th className="px-5 py-3.5">User</th>
                      <th className="px-5 py-3.5">Category & Subject</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {tickets.map(t => (
                      <tr key={t.id} className="hover:bg-paper/50">
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-ink">
                          #TK-{t.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-ink">{t.user_name || 'User'}</p>
                          <p className="text-xs text-muted capitalize">{t.user_role}</p>
                        </td>
                        <td className="px-5 py-4 max-w-[280px]">
                          <span className="text-xs font-semibold text-brand-700 capitalize">
                            [{t.category || 'General'}]
                          </span>
                          <p className="font-medium text-ink truncate" title={t.subject}>
                            {t.subject}
                          </p>
                          {t.description && (
                            <p className="text-xs text-muted truncate max-w-[240px]">{t.description}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-muted">
                          {t.created_at ? t.created_at.split('T')[0] : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            TICKET_STYLES[t.status] || 'bg-gray-100 text-gray-700'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <select
                            value={t.status}
                            onChange={e => handleTicketStatus(t.id, e.target.value)}
                            disabled={actionLoadingId === `ticket-${t.id}`}
                            className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── TAB 5: AI DEMAND FORECASTING & PREDICTIVE ANALYTICS ───────────── */}
      {activeTab === 'forecasting' && (
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Predictive Intelligence"
            title="AI Demand Forecasting & Worker Allocation"
            description="Real-time predictive analytics anticipating seasonal service demand surges and partner availability requirements."
          />

          {!forecastingData ? (
            <div className="card py-16 text-center text-muted">
              <Loader2 size={24} className="animate-spin mx-auto mb-2 text-brand-600" />
              <p className="text-xs">Computing AI demand forecasting models...</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Summary KPIs */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="card p-5 border-l-4 border-l-brand-600 bg-white">
                  <p className="text-xs font-semibold text-muted uppercase">Forecast Horizon</p>
                  <p className="mt-1 font-display text-xl font-bold text-ink">{forecastingData.forecasting_summary.forecast_period}</p>
                  <p className="text-xs text-brand-700 font-semibold mt-1">{forecastingData.forecasting_summary.overall_demand_growth}</p>
                </div>

                <div className="card p-5 border-l-4 border-l-emerald-600 bg-white">
                  <p className="text-xs font-semibold text-muted uppercase">Verified Active Partners</p>
                  <p className="mt-1 font-display text-xl font-bold text-ink">{forecastingData.forecasting_summary.verified_active_workers} Active</p>
                  <p className="text-xs text-muted mt-1">{forecastingData.forecasting_summary.total_registered_workers} Total Registered</p>
                </div>

                <div className="card p-5 border-l-4 border-l-amber-600 bg-white">
                  <p className="text-xs font-semibold text-muted uppercase">Predictive Demand Status</p>
                  <p className="mt-1 font-display text-xl font-bold text-amber-700">Peak Capacity Alert</p>
                  <p className="text-xs text-muted mt-1">Noida &amp; Greater Noida Hotspots</p>
                </div>
              </div>

              {/* AI Strategic Advisories */}
              <div className="card p-6 space-y-4 bg-gradient-to-br from-brand-900 to-brand-800 text-white shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-200">
                  <Zap size={16} className="text-amber-400" />
                  AI Executive Advisories &amp; Actions
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {forecastingData.recommendations.map(rec => (
                    <div key={rec.id} className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-200">{rec.category}</span>
                        <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                          {rec.impact}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{rec.title}</h4>
                      <p className="text-xs text-brand-100/90 leading-relaxed">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* High Demand Hotspots Table */}
              <div className="card p-6 space-y-4 bg-white">
                <h3 className="font-display font-bold text-ink text-base">
                  Top High-Demand Service Hotspots
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="border-b border-line bg-paper text-muted font-medium">
                      <tr>
                        <th className="px-4 py-3">Service Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Seasonal Surge Factor</th>
                        <th className="px-4 py-3">7-Day Projected Demand</th>
                        <th className="px-4 py-3">Active Verified Workers</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {forecastingData.demand_hotspots.map(h => (
                        <tr key={h.service_id} className="hover:bg-paper/40">
                          <td className="px-4 py-3.5 font-semibold text-ink">{h.service_name}</td>
                          <td className="px-4 py-3.5 text-muted">{h.category}</td>
                          <td className="px-4 py-3.5 font-medium text-brand-700">{h.seasonal_factor} ({h.trend_percentage})</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-ink">{h.projected_7day_demand} bookings</td>
                          <td className="px-4 py-3.5 font-mono text-ink">{h.active_verified_workers} partners</td>
                          <td className="px-4 py-3.5 text-right">
                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                              h.urgency_level === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                              h.urgency_level === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-green-50 text-green-700 border-green-200'
                            }`}>
                              {h.urgency_level}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </section>
      )}

    </div>
  )
}
