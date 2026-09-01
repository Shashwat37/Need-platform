/**
 * ReviewModal.jsx — interactive rating & review modal.
 *
 * WHAT: Allows customers to rate their completed service (1-5 stars) and write
 *       a review comment for the cooperative service worker.
 *
 * WHY:  Ratings build worker reputation and trust across the cooperative network
 *       without punitive algorithmic down-grading.
 *
 * HOW:  Calls submitReview() from api.js and updates parent state upon success.
 */

import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Star,
  User,
  X,
} from 'lucide-react'
import { submitReview } from '../services/api'

const RATING_LABELS = {
  1: '1 Star — Poor service',
  2: '2 Stars — Needs improvement',
  3: '3 Stars — Average / Satisfactory',
  4: '4 Stars — Very Good',
  5: '5 Stars — Excellent Service! 🌟',
}

export default function ReviewModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) {
  const [rating, setRating]     = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment]   = useState('')

  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)

  if (!isOpen || !booking) return null

  const activeRating = hoverRating || rating

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      const payload = {
        booking_id: booking.id,
        rating:     rating,
        comment:    comment.trim(),
      }

      await submitReview(payload)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit review. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div className="card relative w-full max-w-md p-6 sm:p-7 shadow-2xl border-brand-100 bg-white">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-paper hover:text-ink transition"
          aria-label="Close review modal"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-verified/10 text-verified animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-display text-xl font-bold text-ink">Thank You for Your Feedback!</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">
              Your {rating}★ review has been recorded on {booking.worker_name || 'the worker'}'s cooperative profile.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-5 text-center">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                <Sparkles size={13} />
                Cooperative Feedback
              </span>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                Rate Your Experience
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Service: <strong className="text-ink">{booking.service_name}</strong> • Provider: <strong className="text-ink">{booking.worker_name || 'Assigned Partner'}</strong>
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Interactive Star Picker */}
              <div className="text-center bg-paper/60 border border-line rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={
                          star <= activeRating
                            ? 'text-yellow-400 fill-yellow-400 transition-colors'
                            : 'text-gray-300 fill-gray-100 transition-colors'
                        }
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold text-brand-700 min-h-[18px]">
                  {RATING_LABELS[activeRating]}
                </p>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Write a Review (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tell us about the quality of work, punctuality, and professionalism..."
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-1 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-primary flex items-center gap-2 text-xs py-2.5 px-5 disabled:opacity-60"
                >
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} className="fill-white" />}
                  <span>{busy ? 'Submitting…' : 'Submit Review'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  )
}
