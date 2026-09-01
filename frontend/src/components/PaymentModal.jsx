/**
 * PaymentModal.jsx — simulated payment checkout for bookings.
 *
 * WHAT: Allows customers to complete payment for a service booking via UPI,
 *       Card, or Cash on Delivery, with optional worker tipping and transparent
 *       90/10 cooperative split breakdown.
 *
 * WHY:  On NEED, payment is transparent. The customer sees exactly how
 *       much goes directly to the worker and how much builds their social security.
 *
 * HOW:  Calls checkoutPayment() from api.js and opens the official invoice receipt.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  CreditCard,
  Heart,
  HeartHandshake,
  IndianRupee,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { checkoutPayment } from '../services/api'

const TIPS = [0, 30, 50, 100]

export default function PaymentModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) {
  const [method, setMethod]     = useState('upi') // 'upi' | 'card' | 'cash'
  const [selectedTip, setSelectedTip] = useState(30)
  const [customTip, setCustomTip]     = useState('')
  const [upiId, setUpiId]       = useState('ananya@okhdfcbank')
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821')
  const [expiry, setExpiry]     = useState('08/28')
  const [cvv, setCvv]           = useState('742')

  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState('')
  const [completedPayment, setCompletedPayment] = useState(null)

  // Start every checkout from a clean slate.
  //
  // WHY: closing this modal only hides it (the `return null` below), it does not
  // unmount it, so React keeps all the state above. Without this reset, paying a
  // second booking opened straight onto the FIRST payment's success screen —
  // showing the old invoice ID — and the Pay button stayed stuck on
  // "Processing Payment…" forever, because `busy` was never set back to false.
  useEffect(() => {
    if (isOpen) {
      setCompletedPayment(null)
      setBusy(false)
      setError('')
      setSelectedTip(30)
      setCustomTip('')
    }
  }, [isOpen, booking?.id])

  if (!isOpen || !booking) return null

  const serviceAmount = booking.amount || 299
  const tipAmount     = customTip !== '' ? Math.max(0, Number(customTip) || 0) : selectedTip
  const totalAmount   = serviceAmount + tipAmount
  const workerTakeHome = Math.round((serviceAmount * 0.90 + tipAmount) * 100) / 100
  const welfareCut    = Math.round((serviceAmount * 0.10) * 100) / 100

  async function handlePay(e) {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      const payload = {
        booking_id: booking.id,
        method:     method,
        tip_amount: tipAmount,
      }

      const res = await checkoutPayment(payload)
      setCompletedPayment(res)
      setBusy(false)
      if (onSuccess) {
        onSuccess(res)
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Payment failed. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div className="card relative w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border-brand-100">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-paper hover:text-ink transition"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Payment Completed Splash */}
        {completedPayment ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-verified/10 text-verified animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-ink">Payment Successful!</h3>
              <p className="font-mono text-xs text-brand-700 font-semibold mt-1">
                Invoice ID: {completedPayment.invoice_id}
              </p>
            </div>

            <div className="rounded-xl border border-verified/30 bg-verified/5 p-4 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between font-medium text-ink">
                <span>Total Paid:</span>
                <span className="font-mono font-bold">₹{completedPayment.total_amount}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Payment Mode:</span>
                <span className="font-mono uppercase">{method} (Simulated)</span>
              </div>
              <div className="border-t border-verified/20 pt-2 flex justify-between text-brand-700 font-semibold">
                <span>Welfare Contribution:</span>
                <span className="font-mono">+₹{completedPayment.welfare_contribution} saved</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="btn btn-primary text-xs py-2 px-5"
              >
                Close & View Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
                <Lock size={14} />
                Cooperative Payment Gateway
              </div>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
                Complete Payment
              </h2>
              <p className="text-xs text-muted">
                Booking #{booking.id} • {booking.service_name} • {booking.worker_name || 'Assigned Partner'}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-2">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMethod('upi')}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                      method === 'upi'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-line bg-white text-muted hover:border-ink/30 hover:text-ink'
                    }`}
                  >
                    <Smartphone size={18} />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('card')}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                      method === 'card'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-line bg-white text-muted hover:border-ink/30 hover:text-ink'
                    }`}
                  >
                    <CreditCard size={18} />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('cash')}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                      method === 'cash'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-line bg-white text-muted hover:border-ink/30 hover:text-ink'
                    }`}
                  >
                    <Banknote size={18} />
                    <span>Cash</span>
                  </button>
                </div>
              </div>

              {/* Method Details (Simulated inputs) */}
              {method === 'upi' && (
                <div className="rounded-xl border border-line bg-paper/60 p-3.5 space-y-2">
                  <label className="block text-xs font-medium text-ink">Virtual Payment Address (VPA)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="mobile@upi or user@okhdfcbank"
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-mono text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 uppercase">
                      Instant Pay
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">Supports Google Pay, PhonePe, Paytm & BHIM</p>
                </div>
              )}

              {method === 'card' && (
                <div className="rounded-xl border border-line bg-paper/60 p-3.5 space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-muted">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-mono text-ink"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-muted">Expiry</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={e => setExpiry(e.target.value)}
                        className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-mono text-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted">CVV</label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={e => setCvv(e.target.value)}
                        className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-mono text-ink"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'cash' && (
                <div className="rounded-xl border border-line bg-paper/60 p-3.5 text-xs text-muted space-y-1">
                  <p className="font-semibold text-ink">Cash on Delivery Receipt</p>
                  <p className="text-[11px]">
                    Pay cash directly to the service provider after job verification. The worker will confirm receipt on their phone.
                  </p>
                </div>
              )}

              {/* Worker Tip Selector */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1.5">
                  <Heart size={14} className="text-red-500 fill-red-500" />
                  Add Worker Appreciation Tip (100% to Worker)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {TIPS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setSelectedTip(t); setCustomTip(''); }}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                        selectedTip === t && customTip === ''
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                          : 'border-line bg-white text-muted hover:text-ink'
                      }`}
                    >
                      {t === 0 ? 'No Tip' : `₹${t}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cooperative Transparency Breakdown */}
              <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 space-y-2.5">
                <div className="flex justify-between text-xs text-muted">
                  <span>Service Base Amount</span>
                  <span className="font-mono text-ink">₹{serviceAmount}</span>
                </div>

                {tipAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Direct Worker Tip</span>
                    <span className="font-mono font-semibold">+₹{tipAmount}</span>
                  </div>
                )}

                <div className="border-t border-brand-200 pt-2 flex justify-between text-sm font-bold text-ink">
                  <span>Total Amount Due</span>
                  <span className="font-mono text-base text-brand-700">₹{totalAmount}</span>
                </div>

                {/* Split Transparency Note */}
                <div className="rounded-xl bg-white p-2.5 border border-brand-100 text-[11px] text-muted space-y-1">
                  <div className="flex justify-between font-medium text-ink">
                    <span>👷 Direct Worker Earnings (90% + Tip):</span>
                    <span className="font-mono text-brand-700 font-bold">₹{workerTakeHome}</span>
                  </div>
                  <div className="flex justify-between text-teal-700 font-medium">
                    <span>🛡️ Cooperative Welfare Fund (10%):</span>
                    <span className="font-mono font-bold">₹{welfareCut}</span>
                  </div>
                  <div className="text-[10px] text-muted pt-0.5">
                    Zero private platform fee. 100% of payment supports the worker & their social security.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={busy}
                  className="btn btn-primary flex items-center gap-2 text-xs py-2.5 px-5 disabled:opacity-60"
                >
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                  <span>{busy ? 'Processing Payment…' : `Pay ₹${totalAmount} Securely`}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
