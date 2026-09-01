/**
 * WorkerDashboard.jsx — the control centre for verified cooperative workers.
 *
 * WHAT: Shows the worker's cooperative member ID card, availability toggle,
 *       earnings, ratings, welfare wallet savings, and assigned job requests.
 *
 * WHY:  On NEED, workers are cooperative owners, not anonymous gig contractors.
 *       The dashboard emphasizes their cooperative membership, verified status,
 *       and welfare safety net.
 *
 * HOW:  Fetches data from GET /api/worker/dashboard and allows toggling
 *       online availability via POST /api/worker/availability.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  HeartHandshake,
  IndianRupee,
  Loader2,
  MapPin,
  Power,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  User,
  Wrench,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getWorkerDashboard, handleWorkerBookingAction, requestWelfareWithdrawal, updateWorkerAvailability } from '../services/api'
import WorkerIdCard from '../components/WorkerIdCard'
import SectionHeading from '../components/SectionHeading'

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------
const STATUS_STYLES = {
  pending:     'bg-yellow-50  text-yellow-700  border-yellow-200',
  accepted:    'bg-blue-50    text-blue-700    border-blue-200',
  in_progress: 'bg-brand-50   text-brand-700   border-brand-100',
  completed:   'bg-green-50   text-green-700   border-green-200',
  cancelled:   'bg-gray-100   text-gray-500    border-gray-200',
  rejected:    'bg-red-50     text-red-700     border-red-200',
}

const STATUS_LABELS = {
  pending:     'Pending Request',
  accepted:    'Accepted',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
  rejected:    'Declined',
}

function BookingStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

import VerificationModal from '../components/VerificationModal'

function VerificationBanner({ status, notes, onOpenModal }) {
  if (status === 'verified') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-verified/30 bg-verified/10 px-4 py-3 text-sm text-ink">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-verified shrink-0" />
          <span>
            <strong className="font-semibold text-verified">Cooperative Verified:</strong> Your identity & skill documents have been approved by the Federation.
          </span>
        </div>
        <button
          onClick={onOpenModal}
          className="rounded-lg border border-verified/40 bg-white px-3 py-1 text-xs font-semibold text-verified hover:bg-verified/10 transition"
        >
          Update Trade Proof
        </button>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-yellow-300 bg-amber-50 px-4 py-3 text-sm text-ink">
        <div className="flex items-center gap-2.5">
          <Shield size={18} className="text-amber-600 shrink-0" />
          <div>
            <span className="font-bold text-amber-800">Verification Pending:</span>
            <span className="ml-1 text-xs text-amber-700">The Federation board is reviewing your submitted proof. Unverified partners cannot accept public bookings.</span>
          </div>
        </div>
        <button
          onClick={onOpenModal}
          className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-700 transition shadow-sm"
        >
          Submit / Edit Documents
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-ink">
      <div className="flex items-center gap-2.5">
        <ShieldAlert size={18} className="text-red-600 shrink-0" />
        <div>
          <span className="font-bold text-red-800">Verification Rejected:</span>
          <span className="ml-1 text-xs text-red-700">{notes || 'Your profile documents require revision before approval.'}</span>
        </div>
      </div>
      <button
        onClick={onOpenModal}
        className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm"
      >
        Re-submit Verification Proof
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({ label, value, icon: Icon, colour, helperText }) {
  return (
    <div className="card flex flex-col justify-between p-5 transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-ink">{value}</p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${colour}`}>
          <Icon size={20} />
        </span>
      </div>
      {helperText && (
        <p className="mt-3 border-t border-line/60 pt-2.5 text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-xl bg-line ${className}`} />
}

function WorkerSkeleton() {
  return (
    <div className="container-page py-10 space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-60" />
        <Skeleton className="h-10 w-36" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-1" />
        <Skeleton className="h-80 lg:col-span-2" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Worker Dashboard
// ---------------------------------------------------------------------------
export default function WorkerDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [togglingAvailability, setTogglingAvailability] = useState(false)

  const [jobActionLoadingId, setJobActionLoadingId] = useState(null)

  // Pass showSkeleton = false for refreshes that follow an action, so the page
  // updates in place instead of blanking to grey placeholder boxes.
  function loadDashboard(showSkeleton = true) {
    if (showSkeleton) setLoading(true)
    setError('')
    getWorkerDashboard()
      .then(setData)
      .catch((err) => {
        setError(err?.response?.data?.error || 'Could not load worker dashboard.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDashboard() }, [])

  async function handleJobAction(bookingId, action) {
    // Ignore a second click while one action is still in flight.
    //
    // WHY: completing a job is what credits the worker's 90% and writes the
    // welfare contribution. Two requests getting through would count the same
    // job twice — inflating earnings, total_jobs and the welfare fund, with no
    // way to tell afterwards which numbers were wrong.
    if (jobActionLoadingId !== null) return

    let note = ''
    if (action === 'complete') {
      const input = window.prompt('Add a brief job completion note (optional):', 'Service completed successfully and verified with customer.')
      if (input === null) return // cancelled prompt
      note = input || 'Service completed.'
    }

    setJobActionLoadingId(bookingId)
    try {
      await handleWorkerBookingAction(bookingId, action, note)
      loadDashboard(false)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update job status.')
    } finally {
      setJobActionLoadingId(null)
    }
  }

  async function handleWithdrawalRequest() {
    if (!data?.wallet) return
    const maxAvailable = Math.max(0, data.wallet.balance - (data.wallet.insurance_contribution || 0))
    if (maxAvailable <= 0) {
      alert('You have no withdrawable emergency balance at this time. Insurance reserve cannot be withdrawn.')
      return
    }

    const amountStr = window.prompt(`Enter emergency withdrawal amount (Max ₹${maxAvailable}):`, maxAvailable.toString())
    if (!amountStr) return

    const amount = Number(amountStr)
    if (isNaN(amount) || amount <= 0 || amount > maxAvailable) {
      alert(`Invalid amount. Please enter a number between ₹1 and ₹${maxAvailable}.`)
      return
    }

    const reason = window.prompt('Specify reason for emergency withdrawal (e.g., Medical emergency, School fees):', 'Medical emergency')
    if (!reason || !reason.trim()) {
      alert('A reason is required for emergency withdrawal review.')
      return
    }

    try {
      const res = await requestWelfareWithdrawal(amount, reason.trim())
      alert(res.message || 'Emergency withdrawal request submitted successfully!')
      loadDashboard(false)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to submit withdrawal request.')
    }
  }

  async function handleToggleAvailability() {
    if (!data?.profile) return
    const current = data.profile.is_available
    setTogglingAvailability(true)
    try {
      const res = await updateWorkerAvailability(!current)
      setData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          is_available: res.is_available,
        }
      }))
    } catch (err) {
      // Show the server's own reason. The backend refuses to put an unverified
      // partner online, and "please try again" would send them in circles.
      alert(err?.response?.data?.error || 'Failed to update availability status. Please try again.')
    } finally {
      setTogglingAvailability(false)
    }
  }

  const [verificationModal, setVerificationModal] = useState({ isOpen: false })

  if (loading) return <WorkerSkeleton />

  if (error) {
    return (
      <div className="container-page py-24 text-center">
        <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
        <p className="mb-6 text-muted">{error}</p>
        <button onClick={() => loadDashboard()} className="btn btn-primary">
          Retry
        </button>
      </div>
    )
  }

  const { user: workerUser, profile, wallet, stats, bookings } = data
  const isAvailable = profile?.is_available ?? false
  const verificationStatus = profile?.verification_status || 'pending'
  const verificationNotes = profile?.verification_notes || ''
  const skillsList = (profile?.skills || '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="container-page py-10 space-y-9">

      {/* ── Top Header with Availability Switch ────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-extrabold text-ink">
              Namaste, {workerUser.name.split(' ')[0]} 🙏
            </h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isAvailable ? 'bg-verified/10 text-verified' : 'bg-gray-200 text-gray-700'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-verified animate-pulse' : 'bg-gray-500'}`} />
              {isAvailable ? 'Online & Available' : 'Offline'}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            {profile?.primary_service || 'Service Partner'} • Member ID: #{workerUser.id.toString().padStart(4, '0')}
          </p>
        </div>

        {/* Availability Toggle Button */}
        <button
          onClick={handleToggleAvailability}
          disabled={togglingAvailability}
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition shadow-sm ${
            isAvailable
              ? 'border-brand-600 bg-brand-50 text-brand-700 hover:bg-brand-100'
              : 'border-line bg-white text-muted hover:text-ink hover:border-ink/40'
          }`}
          title="Click to toggle receiving customer requests"
        >
          {togglingAvailability ? (
            <Loader2 size={18} className="animate-spin text-brand-600" />
          ) : (
            <Power size={18} className={isAvailable ? 'text-brand-600' : 'text-muted'} />
          )}
          <span>{isAvailable ? 'Accepting Jobs' : 'Set as Available'}</span>
        </button>
      </div>

      {/* ── Verification Banner ────────────────────────────────────────── */}
      <VerificationBanner
        status={verificationStatus}
        notes={verificationNotes}
        onOpenModal={() => setVerificationModal({ isOpen: true })}
      />

      {/* ── Key Metrics Grid (4 Cards) ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Earnings"
          value={`₹${stats.earnings.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          colour="bg-emerald-50 text-emerald-700"
          helperText="Directly credited to your account"
        />
        <StatCard
          label="Jobs Completed"
          value={stats.total_jobs}
          icon={CheckCircle2}
          colour="bg-brand-50 text-brand-700"
          helperText="Cooperative verified service history"
        />
        <StatCard
          label="Member Rating"
          value={`${stats.rating} ★`}
          icon={Star}
          colour="bg-marigold-50 text-marigold-600"
          helperText="Based on verified customer reviews"
        />
        <StatCard
          label="Welfare Savings"
          value={`₹${wallet.balance.toLocaleString('en-IN')}`}
          icon={HeartHandshake}
          colour="bg-teal-50 text-teal-700"
          helperText="Set aside for health & insurance"
        />
      </div>

      {/* ── Cooperative ID & Welfare Section ───────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Column 1: Member Card & Profile */}
        <div className="space-y-6">
          <div>
            <SectionHeading
              eyebrow="Cooperative Identity"
              title="Member Card"
              description="Your verified identity card issued by the cooperative."
            />
            <div className="mt-4 max-w-sm">
              <WorkerIdCard
                name={workerUser.name}
                trade={profile?.primary_service || 'General Service'}
                society="NEED Cooperative Fed."
                memberId={`SHR-2026-${workerUser.id.toString().padStart(4, '0')}`}
                rating={stats.rating}
                jobs={stats.total_jobs}
                area={profile?.city || workerUser.address || 'Noida'}
                status={verificationStatus}
              />
            </div>
          </div>

          {/* Qualifications & Profile Card */}
          <div className="card space-y-4 p-5 max-w-sm">
            <h4 className="font-display font-bold text-ink text-sm flex items-center gap-2">
              <Award size={16} className="text-brand-600" />
              Skills & Qualifications
            </h4>

            {skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">No skills listed yet.</p>
            )}

            <div className="border-t border-line pt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Experience:</span>
                <span className="font-semibold text-ink">{profile?.experience_years || 0} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Certification:</span>
                <span className="font-semibold text-ink truncate max-w-[180px]" title={profile?.certifications || 'None'}>
                  {profile?.certifications || 'Self-certified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Service Radius:</span>
                <span className="font-semibold text-ink">{profile?.service_radius_km || 10} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Welfare Wallet Card & Breakdown */}
        <div className="space-y-6 lg:col-span-2">
          <SectionHeading
            eyebrow="Social Security"
            title="Cooperative Welfare Wallet"
            description="Unlike private gig apps, 10% of each job's commission is saved into your personal emergency & welfare fund."
          />

          <div className="card overflow-hidden p-0 border-brand-500/20 shadow-lift">
            {/* Header band */}
            <div className="bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-brand-100">
                    Available Welfare Balance
                  </p>
                  <p className="mt-1 font-mono text-3xl font-extrabold">
                    ₹{wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-2 text-right backdrop-blur-sm">
                  <p className="text-xs text-brand-100">Cooperative Split</p>
                  <p className="font-mono text-sm font-bold text-white">90% Pay • 10% Welfare</p>
                </div>
              </div>
            </div>

            {/* Wallet Details Breakdown */}
            <div className="grid gap-4 p-6 sm:grid-cols-3 bg-white">
              <div className="rounded-xl border border-line p-4">
                <p className="text-xs font-medium text-muted">Total Lifetime Saved</p>
                <p className="mt-1 font-mono text-lg font-bold text-ink">
                  ₹{wallet.total_contribution.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-[11px] text-muted">Accumulated across all completed jobs</p>
              </div>

              <div className="rounded-xl border border-line p-4">
                <p className="text-xs font-medium text-muted">Insurance Reserve</p>
                <p className="mt-1 font-mono text-lg font-bold text-ink">
                  ₹{wallet.insurance_contribution.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-[11px] text-muted">Your 30% share — accident &amp; health coverage</p>
              </div>

              <div className="rounded-xl border border-line p-4">
                <p className="text-xs font-medium text-muted">Withdrawable Savings</p>
                <p className="mt-1 font-mono text-lg font-bold text-ink">
                  ₹{wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-[11px] text-muted">Your 70% share — available for urgent cash withdrawal</p>
              </div>
            </div>

            <div className="border-t border-line bg-paper px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
              <span>Managed transparently by NEED Worker Cooperative Federation</span>
              <button
                onClick={handleWithdrawalRequest}
                className="btn btn-primary text-xs py-1.5 px-3.5 shadow-sm"
              >
                Request Emergency Withdrawal
              </button>
            </div>
          </div>

          {/* Assigned Bookings & Job Requests */}
          <div>
            <SectionHeading
              eyebrow="Activity"
              title="Recent Job Requests"
              description="Service bookings assigned to you by customers in your area."
            />

            <div className="mt-4">
              {bookings.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-12 text-center bg-white">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                    <Briefcase size={22} />
                  </div>
                  <p className="font-medium text-ink">No active booking requests</p>
                  <p className="max-w-sm text-xs text-muted">
                    When customers in your service radius book {profile?.primary_service || 'your service'}, new requests will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="card overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-line bg-paper">
                        <tr>
                          {['Service', 'Schedule', 'Location', 'Amount', 'Status', 'Job Action'].map(h => (
                            <th key={h} className="px-5 py-3 text-left font-medium text-muted">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {bookings.map(b => {
                          const isActing = jobActionLoadingId === b.id
                          return (
                            <tr key={b.id} className="hover:bg-paper">
                              <td className="px-5 py-4 font-medium text-ink">
                                {b.service_name}
                                {b.is_emergency && (
                                  <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                                    Urgent
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-muted">
                                {b.scheduled_date ? `${b.scheduled_date} ${b.scheduled_time || ''}` : '—'}
                              </td>
                              <td className="px-5 py-4 text-muted max-w-[160px] truncate" title={b.address}>
                                {b.address || '—'}
                              </td>
                              <td className="px-5 py-4 font-mono font-medium text-ink">
                                {b.amount > 0 ? `₹${b.amount}` : '—'}
                              </td>
                              <td className="px-5 py-4">
                                <BookingStatusBadge status={b.status} />
                              </td>
                              <td className="px-5 py-4">
                                {isActing ? (
                                  <Loader2 size={16} className="animate-spin text-brand-600" />
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    {b.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => handleJobAction(b.id, 'accept')}
                                          className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-brand-700 transition shadow-sm"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => handleJobAction(b.id, 'decline')}
                                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                                        >
                                          Decline
                                        </button>
                                      </>
                                    )}

                                    {b.status === 'accepted' && (
                                      <button
                                        onClick={() => handleJobAction(b.id, 'start')}
                                        className="rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-teal-700 transition shadow-sm"
                                      >
                                        Start Work
                                      </button>
                                    )}

                                    {b.status === 'in_progress' && (
                                      <button
                                        onClick={() => handleJobAction(b.id, 'complete')}
                                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                                      >
                                        Complete Job
                                      </button>
                                    )}

                                    {b.status === 'completed' && (
                                      <span className="text-xs text-verified font-medium flex items-center gap-1">
                                        <CheckCircle2 size={13} />
                                        Completed
                                      </span>
                                    )}

                                    {['cancelled', 'rejected'].includes(b.status) && (
                                      <span className="text-xs text-muted">Closed</span>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ── Verification Modal ─────────────────────────────────────────── */}
      <VerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ isOpen: false })}
        profile={profile}
        onSuccess={() => {
          loadDashboard(false)
        }}
      />

    </div>
  )
}
