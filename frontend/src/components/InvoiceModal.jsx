/**
 * InvoiceModal.jsx — printable cooperative tax invoice & receipt.
 *
 * WHAT: Renders a clean, official itemized receipt for a completed booking,
 *       including the invoice number, date, payment method, transparent
 *       welfare allocation stamp, and printable layout.
 *
 * WHY:  Proves the transaction happened and guarantees transparency of the
 *       90/10 cooperative worker split.
 *
 * HOW:  Fetches invoice data from getInvoice(invoiceId) and supports window.print().
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  HeartHandshake,
  Loader2,
  Printer,
  ShieldCheck,
  X,
} from 'lucide-react'
import { getInvoice } from '../services/api'

export default function InvoiceModal({
  isOpen,
  onClose,
  invoiceId,
}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (isOpen && invoiceId) {
      setLoading(true)
      setError('')
      getInvoice(invoiceId)
        .then(setData)
        .catch(err => {
          setError(err?.response?.data?.error || 'Could not load invoice details.')
        })
        .finally(() => setLoading(false))
    } else if (isOpen) {
      // Opened with no invoice id. Without this branch `loading` stays true from
      // its initial value and the modal spins forever with no way out.
      setLoading(false)
      setError('This booking does not have an invoice yet.')
    }
  }, [isOpen, invoiceId])

  if (!isOpen) return null

  function handlePrint() {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="card relative w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-9 shadow-2xl border-brand-100 bg-white print:max-h-none print:shadow-none print:border-none print:p-0">

        {/* Close button (hidden on print) */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1 text-muted hover:bg-paper hover:text-ink transition print:hidden"
          aria-label="Close invoice"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 size={32} className="animate-spin text-brand-600 mx-auto" />
            <p className="text-xs text-muted">Loading invoice receipt…</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle size={36} className="text-red-500 mx-auto" />
            <p className="text-sm text-muted">{error}</p>
            <button onClick={onClose} className="btn btn-outline text-xs">
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6 text-ink">

            {/* ── Top Federation Header ───────────────────────────────────── */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-display font-extrabold text-white text-sm">
                    SS
                  </div>
                  <span className="font-display text-xl font-extrabold tracking-tight text-ink">
                    ShramSetu
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Worker Cooperative Federation of India
                </p>
                <p className="text-[11px] text-muted">
                  Empowering service professionals with dignity & social security
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-verified/10 text-verified border border-verified/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 size={13} />
                  {data.payment_status}
                </span>
                <p className="font-mono text-xs font-bold text-ink mt-2">
                  {data.invoice_id}
                </p>
                <p className="text-xs text-muted">Date: {data.date}</p>
              </div>
            </div>

            {/* ── Customer & Worker Meta Columns ─────────────────────────── */}
            <div className="grid gap-6 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-line bg-paper/50 p-4 space-y-1">
                <p className="font-bold text-ink uppercase tracking-wider text-[10px] text-muted">Billed To (Customer)</p>
                <p className="font-semibold text-sm text-ink">{data.customer.name}</p>
                <p className="text-muted">{data.customer.phone}</p>
                <p className="text-muted">{data.customer.email}</p>
                <p className="text-muted pt-1 border-t border-line/60">{data.customer.address || 'Service Location'}</p>
              </div>

              <div className="rounded-xl border border-line bg-paper/50 p-4 space-y-1">
                <p className="font-bold text-ink uppercase tracking-wider text-[10px] text-muted">Service Provider (Cooperative Member)</p>
                <p className="font-semibold text-sm text-ink">{data.worker.name}</p>
                <p className="text-brand-700 font-medium">{data.worker.trade}</p>
                <p className="text-muted">{data.worker.society}</p>
                <p className="text-[11px] text-muted pt-1 border-t border-line/60 font-mono">
                  Member ID: #SHR-2026-{(data.worker.id || 0).toString().padStart(4, '0')}
                </p>
              </div>
            </div>

            {/* ── Booking & Itemized Charges Table ────────────────────────── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Service Breakdown</p>
              <div className="rounded-xl border border-line overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="border-b border-line bg-paper text-muted font-medium">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Description</th>
                      <th className="px-4 py-2.5 text-center">Schedule</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    <tr>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{data.booking.service_name}</p>
                        <p className="text-muted text-[11px]">{data.booking.description || 'Standard service request'}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-muted">
                        {data.booking.scheduled_date} ({data.booking.scheduled_time || 'Day'})
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-ink">
                        ₹{data.breakdown.base_fare}
                      </td>
                    </tr>

                    {data.breakdown.emergency_fee > 0 && (
                      <tr>
                        <td className="px-4 py-2.5 text-red-700 font-medium">
                          Urgent / Emergency Rush Dispatch Fee
                        </td>
                        <td className="px-4 py-2.5 text-center text-muted text-[11px]">60-Min Priority</td>
                        <td className="px-4 py-2.5 text-right font-mono text-red-700 font-medium">
                          +₹{data.breakdown.emergency_fee}
                        </td>
                      </tr>
                    )}

                    {data.breakdown.tip_amount > 0 && (
                      <tr>
                        <td className="px-4 py-2.5 text-emerald-700 font-medium">
                          Worker Appreciation Tip (100% direct)
                        </td>
                        <td className="px-4 py-2.5 text-center text-muted text-[11px]">Direct Tip</td>
                        <td className="px-4 py-2.5 text-right font-mono text-emerald-700 font-medium">
                          +₹{data.breakdown.tip_amount}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="border-t-2 border-line bg-paper font-bold text-sm">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-ink">
                        Total Amount Paid ({data.payment_method})
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-brand-700 text-base">
                        ₹{data.breakdown.total_paid}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* ── Transparent Cooperative Welfare Allocation Stamp ───────── */}
            <div className="rounded-xl border border-verified/30 bg-verified/5 p-4 flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-verified/10 text-verified">
                <HeartHandshake size={22} />
              </span>
              <div className="text-xs">
                <p className="font-bold text-ink">Cooperative Social Security Contribution</p>
                <p className="text-muted text-[11px]">
                  <strong className="text-verified font-semibold font-mono">₹{data.breakdown.welfare_contribution}</strong> (10% of fare) was saved directly into {data.worker.name}'s cooperative emergency & health fund.
                </p>
              </div>
            </div>

            {/* ── Footer Actions (Print / Close) ──────────────────────────── */}
            <div className="flex items-center justify-between border-t border-line pt-4 print:hidden">
              <span className="text-[11px] text-muted">
                Official Receipt • ShramSetu Digital Invoice
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="btn btn-outline flex items-center gap-1.5 text-xs py-2 px-4"
                >
                  <Printer size={15} />
                  Print / Save PDF
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-primary text-xs py-2 px-4"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
