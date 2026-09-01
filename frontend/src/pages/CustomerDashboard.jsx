/**
 * CustomerDashboard.jsx — the home screen for logged-in customers.
 *
 * WHAT: Shows the customer's profile, booking stats, recent bookings with
 *       cancellation controls, and interactive quick-book service tiles.
 *
 * WHY:  A dashboard gives customers a single place to understand their
 *       relationship with the platform — what they've booked, what's happening
 *       now, and what they can book next.
 *
 * HOW:  Fetches data from /api/customer/dashboard and integrates BookingModal
 *       for seamless booking directly from the dashboard.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Receipt,
  Star,
  User,
  X,
  XCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cancelBooking, getCustomerDashboard } from '../services/api'
import { getServiceIcon } from '../components/serviceIcons'
import SectionHeading from '../components/SectionHeading'
import BookingModal from '../components/BookingModal'
import PaymentModal from '../components/PaymentModal'
import InvoiceModal from '../components/InvoiceModal'
import ReviewModal from '../components/ReviewModal'

// ---------------------------------------------------------------------------
// Status badge
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
  pending:     'Pending',
  accepted:    'Accepted',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
  rejected:    'Rejected',
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Row actions
//
// WHY a separate component: each booking row offers a different action
// depending on where the job has reached, and putting that decision in one
// place keeps the table readable. The rules are:
//   pending / accepted   → the job hasn't started, so it can still be cancelled
//   completed & unpaid   → the worker has finished, so now it can be paid for
//   paid                 → the receipt exists, so show it
//   anything else        → nothing to do (in progress, cancelled, rejected)
//
// We deliberately do NOT offer "Pay Now" before the worker marks the job
// complete, so a customer can never pay for work that hasn't happened yet.
// ---------------------------------------------------------------------------
function RowActions({ booking, cancellingId, onCancel, onPay, onInvoice, onReview }) {
  const canCancel  = ['pending', 'accepted'].includes(booking.status)
  const canPay     = booking.status === 'completed' && !booking.is_paid
  const canInvoice = Boolean(booking.is_paid && booking.invoice_id)
  const canReview  = booking.status === 'completed' && !booking.review
  const hasReview  = Boolean(booking.review)

  if (!canCancel && !canPay && !canInvoice && !canReview && !hasReview) {
    return <span className="text-xs text-muted">—</span>
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {canCancel && (
        <button
          onClick={() => onCancel(booking.id)}
          disabled={cancellingId === booking.id}
          className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition disabled:opacity-50"
        >
          {cancellingId === booking.id ? 'Cancelling…' : 'Cancel'}
        </button>
      )}

      {canPay && (
        <button
          onClick={() => onPay(booking)}
          className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700 transition"
        >
          <CreditCard size={13} />
          Pay Now
        </button>
      )}

      {canInvoice && (
        <button
          onClick={() => onInvoice(booking.invoice_id)}
          className="flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-ink hover:bg-paper transition"
        >
          <Receipt size={13} />
          Invoice
        </button>
      )}

      {canReview && (
        <button
          onClick={() => onReview(booking)}
          className="flex items-center gap-1 rounded-lg border border-yellow-300 bg-yellow-50 px-2 py-1 text-xs font-bold text-yellow-800 hover:bg-yellow-100 transition"
        >
          <Star size={12} className="text-yellow-600 fill-yellow-500" />
          Review
        </button>
      )}

      {hasReview && (
        <span className="inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50/70 px-2 py-0.5 text-[11px] font-bold text-yellow-800">
          <Star size={11} className="text-yellow-500 fill-yellow-400" />
          {booking.review.rating}★ Rated
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({ label, value, icon: Icon, colour }) {
  return (
    <div className="card flex items-center gap-4 p-5 transition-shadow hover:shadow-card">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${colour}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="font-mono text-2xl font-bold text-ink">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-xl bg-line ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="container-page py-10 space-y-8">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0,1,2].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0,1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-32" />)}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty bookings state
// ---------------------------------------------------------------------------
function EmptyBookings({ onBookClick }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-12 text-center bg-white">
      <Briefcase size={32} className="text-muted" />
      <p className="font-medium text-ink">No bookings yet</p>
      <p className="text-sm text-muted">Your scheduled services and booking receipts will appear here.</p>
      <button
        onClick={onBookClick}
        className="btn btn-outline text-xs mt-2"
      >
        Schedule Your First Service
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------
export default function CustomerDashboard() {
  const { user }            = useAuth()
  const [data,  setData]    = useState(null)
  const [error, setError]   = useState('')
  const [loading, setLoad]  = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  // Booking Modal State
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    service: null,
    worker: null,
  })

  // Payment Modal State — holds the whole booking, because PaymentModal needs
  // its amount and service name to show the price breakdown.
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    booking: null,
  })

  // Invoice Modal State — only needs the invoice ID; the modal fetches the
  // rest from /api/payments/invoices/<id> itself.
  const [invoiceModal, setInvoiceModal] = useState({
    isOpen: false,
    invoiceId: null,
  })

  // Review Modal State
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    booking: null,
  })

  // Pass showSkeleton = false for refreshes that happen after an action.
  //
  // WHY: the `if (loading)` branch below replaces the ENTIRE page with grey
  // placeholder boxes. Reusing it for post-action refreshes made the whole
  // dashboard vanish and snap back every time you cancelled a booking or
  // finished a payment, which reads as a crash-and-reload on a projector. The
  // very first load still shows the skeleton, because then there really is
  // nothing on screen yet.
  function fetchDashboard(showSkeleton = true) {
    if (showSkeleton) setLoad(true)
    setError('')
    getCustomerDashboard()
      .then(setData)
      // Show what the server actually said. A 401 after the session expires
      // needs "please log in again", not "is the backend running?".
      .catch(err => setError(
        err?.response?.data?.error || 'Could not load your dashboard. Is the backend running?'
      ))
      .finally(() => setLoad(false))
  }

  useEffect(() => { fetchDashboard() }, [])

  // Cancel a pending booking
  async function handleCancel(bookingId) {
    if (cancellingId !== null) return
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return
    setCancellingId(bookingId)
    try {
      await cancelBooking(bookingId)
      fetchDashboard(false)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to cancel booking.')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) return <DashboardSkeleton />

  // Only take over the whole screen when there is nothing to show.
  //
  // WHY the `!data` guard: a refresh after an action can fail on its own (a slow
  // reply, a dropped connection) while the cancellation or payment it followed
  // already went through on the server. Blanking the page then told the customer
  // their action had failed when it had actually worked. Now the page stays put
  // and a thin banner admits the numbers may be a moment out of date.
  if (error && !data) {
    return (
      <div className="container-page py-24 text-center">
        <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
        <p className="mb-6 text-muted">{error}</p>
        <button onClick={() => fetchDashboard()} className="btn btn-primary">
          Retry
        </button>
      </div>
    )
  }

  const { profile, stats, bookings, services } = data

  return (
    <div className="container-page py-10 space-y-10">

      {/* ── Stale-data banner ──────────────────────────────────────────────
          Only appears when a refresh failed but we still have data to show.
          The action that triggered the refresh already succeeded on the server;
          this just admits the figures below may be a moment behind. */}
      {error && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error} Showing the last loaded data.</span>
          <button
            onClick={() => fetchDashboard()}
            className="ml-auto rounded-lg border border-yellow-300 bg-white px-2.5 py-1 font-semibold text-yellow-800 hover:bg-yellow-100 transition"
          >
            Refresh
          </button>
        </div>
      )}

      {/* ── Welcome header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Hello, {profile.name.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-muted">Here's a summary of your activity on NEED.</p>
        </div>

        <button
          onClick={() => setBookingModal({ isOpen: true, service: null, worker: null })}
          className="btn btn-primary shrink-0 flex items-center gap-2"
        >
          <Plus size={16} />
          Book a Service
        </button>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Bookings"
          value={stats.total}
          icon={Briefcase}
          colour="bg-brand-50 text-brand-700"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          colour="bg-green-50 text-green-700"
        />
        <StatCard
          label="In Progress / Pending"
          value={stats.pending}
          icon={Clock}
          colour="bg-yellow-50 text-yellow-700"
        />
      </div>

      {/* ── Profile card ───────────────────────────────────────────────── */}
      <section>
        <SectionHeading
          title="My Profile"
          description="Your account details"
        />
        <div className="card mt-4 grid gap-4 p-6 sm:grid-cols-2">
          <Detail icon={User}        label="Name"    value={profile.name} />
          <Detail icon={Phone}       label="Phone"   value={profile.phone} />
          <Detail
            icon={IndianRupee}
            label="Email"
            value={profile.email}
            className="sm:col-span-2 md:col-span-1"
          />
          {profile.address && (
            <Detail icon={MapPin} label="Address" value={profile.address} />
          )}
        </div>
      </section>

      {/* ── Recent bookings ────────────────────────────────────────────── */}
      <section>
        <SectionHeading
          title="Recent Bookings"
          description="Track your scheduled services and request status."
        />
        <div className="mt-4">
          {bookings.length === 0 ? (
            <EmptyBookings onBookClick={() => setBookingModal({ isOpen: true, service: null, worker: null })} />
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-line bg-paper">
                    <tr>
                      {['Booking ID', 'Service', 'Date & Time', 'Worker', 'Amount', 'Status', 'Action'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-medium text-muted">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-paper">
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-ink">
                          #BK-{b.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-5 py-4 font-medium text-ink">
                          {b.service_name}
                          {b.is_emergency && (
                            <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 uppercase">
                              Urgent
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-muted">
                          {b.scheduled_date
                            ? `${b.scheduled_date} (${b.scheduled_time || 'Day'})`
                            : '—'}
                        </td>
                        <td className="px-5 py-4 text-muted">{b.worker_name || 'Auto-assigning…'}</td>
                        <td className="px-5 py-4 font-mono font-bold text-ink">
                          {b.amount > 0 ? `₹${b.amount}` : '—'}
                          {/* Paid marker: the amount is where a customer looks
                              to ask "have I settled this?", so answer it here. */}
                          {b.is_paid && (
                            <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-green-700">
                              Paid
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-5 py-4">
                          <RowActions
                            booking={b}
                            cancellingId={cancellingId}
                            onCancel={handleCancel}
                            onPay={(booking) => setPaymentModal({ isOpen: true, booking })}
                            onInvoice={(invoiceId) => setInvoiceModal({ isOpen: true, invoiceId })}
                            onReview={(booking) => setReviewModal({ isOpen: true, booking })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Quick-book services ────────────────────────────────────────── */}
      <section>
        <SectionHeading
          title="Quick Book"
          description="Click any service below to open the booking scheduler."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {services.map(s => (
            <button
              key={s.id}
              onClick={() => setBookingModal({ isOpen: true, service: s, worker: null })}
              className="card flex items-center gap-3 p-4 text-left transition hover:shadow-lift hover:border-brand-500 group"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 group-hover:bg-brand-100">
                {(() => {
                  const Icon = getServiceIcon(s.icon)
                  return <Icon size={18} />
                })()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink group-hover:text-brand-700">{s.name}</p>
                <p className="font-mono text-xs text-muted">from ₹{s.starting_price}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Booking Modal ──────────────────────────────────────────────── */}
      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false, service: null, worker: null })}
        service={bookingModal.service}
        worker={bookingModal.worker}
        allServices={services}
        onSuccess={() => {
          fetchDashboard(false)
        }}
      />

      {/* ── Payment Modal (simulated) ────────────────────────────────────── */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, booking: null })}
        booking={paymentModal.booking}
        onSuccess={() => {
          fetchDashboard(false)
        }}
      />

      {/* ── Invoice Modal (printable receipt) ───────────────────────────── */}
      <InvoiceModal
        isOpen={invoiceModal.isOpen}
        onClose={() => setInvoiceModal({ isOpen: false, invoiceId: null })}
        invoiceId={invoiceModal.invoiceId}
      />

      {/* ── Review Modal (star rating & feedback) ───────────────────────── */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, booking: null })}
        booking={reviewModal.booking}
        onSuccess={() => {
          fetchDashboard(false)
        }}
      />

    </div>
  )
}

// ---------------------------------------------------------------------------
// Small helper
// ---------------------------------------------------------------------------
function Detail({ icon: Icon, label, value, className = '' }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
        <Icon size={15} />
      </span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium text-ink">{value}</p>
      </div>
    </div>
  )
}
