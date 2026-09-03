/**
 * DisputeModal.jsx — Modal to raise a structured booking dispute.
 */

import { useState } from 'react'
import { AlertTriangle, Loader2, ShieldAlert, X } from 'lucide-react'
import { createDispute } from '../services/api'

export default function DisputeModal({ isOpen, onClose, booking, onDisputeCreated }) {
  const [category, setCategory] = useState('Quality Dispute')
  const [description, setDescription] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !booking) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) {
      setError('Please provide a description of the issue.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await createDispute({
        booking_id: booking.id,
        category,
        description: description.trim(),
        evidence_url: evidenceUrl.trim(),
      })

      if (onDisputeCreated) {
        onDisputeCreated(res.dispute)
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit dispute. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-line">
        <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ink">Raise Structured Dispute</h3>
              <p className="text-xs text-muted">Booking #{booking.id} — {booking.service_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-stone-100 hover:text-ink transition"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Issue Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-ink focus:border-brand-500 focus:outline-none"
            >
              <option value="Quality Dispute">Quality Dispute (Unsatisfactory Work)</option>
              <option value="Payment Issue">Payment & Pricing Dispute</option>
              <option value="Late Arrival">Unpunctuality / Delay</option>
              <option value="Conduct Issue">Unprofessional Conduct</option>
              <option value="Damage Claim">Property Damage Claim</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Detailed Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what went wrong in detail so the Cooperative & Federation can review fairly..."
              className="w-full rounded-xl border border-line bg-surface p-3 text-xs text-ink placeholder:text-muted focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Evidence Photo / Document URL (Optional)</label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://example.com/photo-evidence.jpg"
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink placeholder:text-muted focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/60 text-[11px] text-amber-800">
            <strong>Federation Guarantee:</strong> Disputes are reviewed by the Labour Cooperative Administrator and Platform Authorities to protect both customer rights and worker fair treatment.
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-muted hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
