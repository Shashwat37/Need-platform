/**
 * SupportPage.jsx — Help & Support Desk page for Customers & Workers.
 *
 * WHAT: Provides FAQ knowledge base, support ticket submission form, and live ticket tracker.
 * WHY:  Ensures transparent dispute arbitration, payment help, and cooperative support.
 * HOW:  Calls getUserTickets() and createSupportTicket() from api.js.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck2,
  HelpCircle,
  LifeBuoy,
  Loader2,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { createSupportTicket, getUserTickets } from '../services/api'
import SectionHeading from '../components/SectionHeading'

const CATEGORIES = [
  'General Inquiry',
  'Payment Issue',
  'Service Dispute',
  'Account & Verification',
  'Welfare Wallet',
  'Safety & Emergency',
]

const FAQS = [
  {
    q: 'How does the 90/10 Cooperative split work?',
    a: 'Unlike private gig apps that keep 25-30% platform margin, NEED routes 90% directly to the worker and 10% into the worker’s personal Welfare Wallet (70% liquid emergency pool + 30% insurance reserve).',
  },
  {
    q: 'How do I request an Emergency Cash Withdrawal from my Welfare Wallet?',
    a: 'Verified workers can request emergency cash withdrawals directly from their Worker Dashboard under the Welfare Wallet card. The Federation Board reviews and approves requests within 24 hours.',
  },
  {
    q: 'What should I do if a service provider is delayed or cancels?',
    a: 'You can track booking status live on your Customer Dashboard. If needed, submit a ticket under "Service Dispute" with your Booking ID for immediate assistance.',
  },
  {
    q: 'How long does Member Verification take?',
    a: 'Federation admins verify submitted Govt ID and ITI trade certificates within 12-24 hours.',
  },
]

export default function SupportPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form State
  const [category, setCategory] = useState(CATEGORIES[0])
  const [subject, setSubject] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [description, setDescription] = useState('')
  const [attachmentFile, setAttachmentFile] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    try {
      setLoading(true)
      const data = await getUserTickets()
      setTickets(data.tickets || [])
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load support tickets.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!subject.trim()) {
      setFormError('Please enter a ticket subject.')
      return
    }

    if (!description.trim()) {
      setFormError('Please provide ticket details or description.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        category,
        subject: subject.trim(),
        description: description.trim(),
        booking_id: bookingId ? Number(bookingId) : null,
      }

      const res = await createSupportTicket(payload)
      setFormSuccess(res.message || 'Support ticket created successfully!')
      setSubject('')
      setBookingId('')
      setDescription('')
      loadTickets()
    } catch (err) {
      setFormError(err?.response?.data?.error || 'Failed to submit support ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-10 space-y-10">

      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
            <LifeBuoy size={16} />
            NEED Federation Help Center
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
            Help &amp; Support Desk
          </h1>
          <p className="mt-1 text-sm text-muted">
            Transparent dispute arbitration, payment help, and member assistance.
          </p>
        </div>

        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs text-brand-800">
          <p className="font-bold">Cooperative Support Promise</p>
          <p className="text-muted">Average response time: &lt; 2 hours</p>
        </div>
      </div>

      {/* ── Knowledge Base FAQs ────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading
          eyebrow="Knowledge Base"
          title="Frequently Asked Questions"
          description="Quick answers to common questions about bookings, payments, and cooperative welfare."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="card p-5 space-y-2 hover:border-brand-300 transition">
              <h3 className="font-bold text-ink text-sm flex items-start gap-2">
                <HelpCircle size={16} className="text-brand-600 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-muted leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form & Ticket Tracker Grid ─────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-5">

        {/* Form (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeading
            eyebrow="Need Assistance?"
            title="Create Support Ticket"
            description="Submit an inquiry to the NEED Federation support team."
          />

          <div className="card p-6 bg-white border-line shadow-sm">
            {formSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-700">
                <CheckCircle2 size={16} className="shrink-0 text-green-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">

              {/* Category */}
              <div>
                <label className="block font-medium text-ink mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-medium text-ink mb-1">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Payment receipt clarification for Booking #12"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Booking ID (Optional) */}
              <div>
                <label className="block font-medium text-ink mb-1">
                  Related Booking ID <span className="text-muted font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={bookingId}
                  onChange={e => setBookingId(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-ink mb-1">
                  Description Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Please describe your issue or question in detail..."
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Upload Screenshot / Attachment */}
              <div>
                <label className="block font-medium text-ink mb-1 flex items-center justify-between">
                  <span>Attach Screenshot / Receipt <span className="text-muted font-normal">(Optional)</span></span>
                  <span className="text-[10px] text-muted">Max 5MB</span>
                </label>

                {!attachmentFile ? (
                  <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper/50 hover:bg-brand-50/50 hover:border-brand-300 p-3 text-center cursor-pointer transition">
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/jpg,image/png"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setAttachmentFile({
                            name: file.name,
                            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                          })
                        }
                      }}
                      className="hidden"
                    />
                    <UploadCloud size={16} className="text-brand-600" />
                    <span className="text-xs font-semibold text-brand-700">Upload Image / PDF Screenshot</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/60 p-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <FileCheck2 size={16} className="text-brand-600" />
                      <span className="font-bold text-ink truncate max-w-[180px]">{attachmentFile.name}</span>
                      <span className="text-[10px] text-muted">({attachmentFile.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachmentFile(null)}
                      className="text-muted hover:text-red-600 p-1"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                <span>{submitting ? 'Submitting...' : 'Submit Support Ticket'}</span>
              </button>

            </form>
          </div>
        </div>

        {/* My Tickets Tracker List (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <SectionHeading
            eyebrow="Live Tracker"
            title="My Support Tickets"
            description="Track real-time status and responses from the Federation support desk."
          />

          <div className="card p-0 overflow-hidden bg-white border-line shadow-sm">
            {loading ? (
              <div className="py-12 text-center text-muted">
                <Loader2 size={24} className="animate-spin mx-auto mb-2 text-brand-600" />
                <p className="text-xs">Loading support tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-16 text-center text-muted">
                <MessageSquare size={36} className="mx-auto mb-3 text-muted/50" />
                <p className="font-semibold text-ink text-sm">No support tickets submitted yet</p>
                <p className="text-xs max-w-xs mx-auto mt-1">Use the form on the left to submit an inquiry or report an issue.</p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {tickets.map(t => (
                  <div key={t.id} className="p-5 space-y-2 hover:bg-paper/50 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink">#{t.id}</span>
                        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
                          {t.category}
                        </span>
                        {t.booking_id && (
                          <span className="text-[11px] font-mono text-muted">
                            Booking #{t.booking_id} {t.service_name ? `(${t.service_name})` : ''}
                          </span>
                        )}
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                        t.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                        t.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {t.status === 'resolved' && <CheckCircle2 size={12} />}
                        {t.status === 'in_progress' && <Clock size={12} />}
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-ink text-sm">{t.subject}</h4>
                    <p className="text-xs text-muted leading-relaxed">{t.description}</p>

                    {/* Admin Response Box */}
                    {t.admin_response && (
                      <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50/60 p-3.5 text-xs text-ink space-y-1">
                        <div className="font-bold text-brand-800 flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-brand-600" />
                          Federation Resolution Note:
                        </div>
                        <p className="text-muted leading-relaxed">{t.admin_response}</p>
                      </div>
                    )}

                    <div className="text-[11px] text-muted pt-1">
                      Submitted on {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
