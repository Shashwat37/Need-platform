/**
 * PaymentModal.jsx — Stitch Cooperative Checkout & Transparent Remittance.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  CreditCard,
  Heart,
  Loader2,
  Lock,
  QrCode,
  Receipt,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react'
import { checkoutPayment } from '../services/api'

const TIPS = [0, 30, 50, 100]

function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523.25, now)
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.15)
    gain1.gain.setValueAtTime(0.3, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.6)
  } catch (e) {
    // Fallback if audio blocked
  }
}

export default function PaymentModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) {
  const [method, setMethod]           = useState('upi')
  const [selectedTip, setSelectedTip] = useState(30)
  const [customTip, setCustomTip]     = useState('')
  const [upiId, setUpiId]             = useState('thakuraayush@fam')
  const [cardNumber, setCardNumber]   = useState('4532 •••• •••• 8821')
  const [expiry, setExpiry]           = useState('08/28')
  const [cvv, setCvv]                 = useState('742')

  const [busy, setBusy]               = useState(false)
  const [error, setError]             = useState('')
  const [completedPayment, setCompletedPayment] = useState(null)

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
      playSuccessChime()
      setBusy(false)
    } catch (err) {
      setError(err?.response?.data?.error || 'Payment failed. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm"
        onClick={busy ? undefined : onClose}
      />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/60 z-10 my-8 animate-fade-in">
        {/* Razorpay Dark Navy Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 font-extrabold text-lg shadow-sm">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-300 uppercase tracking-widest font-bold">
                <span>Razorpay Trusted Merchant</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h2 className="font-headline-sm text-base font-extrabold text-white tracking-tight">
                NEED Federation Checkout
              </h2>
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            <div>
              <span className="text-[10px] font-mono text-blue-300 uppercase block">Amount Payable</span>
              <div className="font-metric-val text-xl text-emerald-400 font-black leading-tight">
                ₹{totalAmount}
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={busy}
              className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Beneficiary Artisan Direct Remittance Callout */}
        <div className="bg-gradient-to-r from-blue-900/20 via-blue-800/10 to-transparent px-5 py-2.5 border-b border-outline-variant/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
            <span className="font-medium text-on-surface">
              Direct Payout Beneficiary: <strong className="text-primary font-bold">{booking.worker_name || 'Pooja Bisht'}</strong>
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            UPI: thakuraayush@fam
          </span>
        </div>

        {/* Payment Success Splash */}
        {completedPayment ? (
          <div className="p-8 text-center space-y-6 animate-scale-up relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-surface-container-lowest to-surface-container-lowest">
            {/* Floating celebratory glow rings */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Razorpay Success Badge */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xl border-4 border-white">
                <CheckCircle2 size={48} className="animate-bounce" />
              </div>
            </div>

            {/* Title & Badge */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-500/20">
                <Sparkles size={14} className="text-emerald-600" />
                Razorpay Payment Successful
              </div>
              <h3 className="font-headline-lg text-2xl font-black text-on-surface pt-1">
                ₹{completedPayment.total_amount || totalAmount} Paid!
              </h3>
              <p className="font-mono text-xs text-on-surface-variant">
                Razorpay Payment ID: <span className="font-bold text-primary font-mono">{completedPayment.invoice_id}</span>
              </p>
            </div>

            {/* Beneficiary Remittance Confirmation Box */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs space-y-2.5 text-left shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-500/20">
                <span className="font-bold text-emerald-900">Direct Remittance Account:</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  thakuraayush@fam
                </span>
              </div>
              <div className="flex justify-between text-on-surface">
                <span className="text-on-surface-variant">Beneficiary Artisan:</span>
                <span className="font-bold text-on-surface">{booking.worker_name || 'Pooja Bisht'}</span>
              </div>
              <div className="flex justify-between text-on-surface">
                <span className="text-on-surface-variant">Artisan Payout (90% + Tip):</span>
                <span className="font-mono font-bold text-emerald-700">₹{completedPayment.worker_take_home || workerTakeHome} transferred to thakuraayush@fam</span>
              </div>
              <div className="flex justify-between text-on-surface">
                <span className="text-on-surface-variant">Co-op Welfare Reserve (10%):</span>
                <span className="font-mono font-bold text-secondary">₹{completedPayment.welfare_contribution || welfareCut}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onSuccess) onSuccess(completedPayment)
                  onClose()
                }}
                className="w-full bg-[#0c2340] hover:bg-slate-900 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>🎉 Done • Return to Dashboard</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={16} className="text-error shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Razorpay Method Tabs */}
            <div className="space-y-1.5">
              <label className="font-label-md text-xs text-on-surface font-bold flex items-center justify-between">
                <span>Select Payment Method</span>
                <span className="text-[10px] text-blue-600 font-mono font-bold">Razorpay Standard Checkout</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('qr')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'qr'
                      ? 'border-blue-600 bg-blue-600/10 text-blue-900 font-bold shadow-sm ring-2 ring-blue-600/20'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <QrCode size={20} className="text-blue-700" />
                  <span className="text-xs font-semibold">UPI QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'upi'
                      ? 'border-blue-600 bg-blue-600/10 text-blue-900 font-bold shadow-sm ring-2 ring-blue-600/20'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <Smartphone size={20} className="text-blue-700" />
                  <span className="text-xs font-semibold">UPI VPA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'card'
                      ? 'border-blue-600 bg-blue-600/10 text-blue-900 font-bold shadow-sm ring-2 ring-blue-600/20'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <CreditCard size={20} className="text-blue-700" />
                  <span className="text-xs font-semibold">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('cash')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'cash'
                      ? 'border-amber-600 bg-amber-500/10 text-amber-900 font-bold shadow-sm ring-2 ring-amber-500/20'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <Banknote size={20} className="text-amber-600" />
                  <span className="text-xs font-semibold">Cash</span>
                </button>
              </div>
            </div>

            {/* Dynamic Method Details */}
            {method === 'qr' && (
              <div className="p-4 rounded-xl bg-surface-container-low text-center space-y-3 border border-outline-variant/40 animate-fade-in">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-xs text-on-surface">Scan &amp; Pay via Any UPI App</span>
                  <span className="bg-emerald-500/10 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live Dynamic QR
                  </span>
                </div>

                <div className="mx-auto w-48 h-48 bg-white p-2.5 rounded-2xl shadow-lg border border-outline-variant/60 flex flex-col items-center justify-center relative group">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=thakuraayush@fam&pn=${encodeURIComponent(booking.worker_name || 'Pooja Bisht')}&am=${totalAmount}&cu=INR&tn=NEEDRef${booking.id}`)}`}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <span className="absolute -bottom-2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-md font-mono">
                    Pay ₹{totalAmount}
                  </span>
                </div>

                <div className="pt-2 text-xs space-y-1">
                  <div className="font-mono text-on-surface">
                    Remitting to: <strong className="text-primary font-mono">thakuraayush@fam</strong> ({booking.worker_name || 'Pooja Bisht'})
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Open PhonePe, GPay, Paytm or BHIM to scan &amp; complete payment.
                  </p>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div className="p-3.5 rounded-xl bg-surface-container-low space-y-2.5 border border-outline-variant/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface">Enter VPA / UPI ID</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Google Pay / PhonePe / Paytm / FamPay</span>
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="thakuraayush@fam"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-mono font-medium text-on-surface focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                />
              </div>
            )}

            {method === 'card' && (
              <div className="p-3.5 rounded-xl bg-surface-container-low space-y-2.5 border border-outline-variant/40">
                <span className="font-semibold text-xs text-on-surface block">Credit / Debit Card</span>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card Number"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-mono font-medium text-on-surface focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-mono font-medium text-on-surface focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                  />
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="CVV"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-mono font-medium text-on-surface focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {method === 'cash' && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Banknote size={16} />
                  Cash After Service Handover
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  Pay ₹{totalAmount} in cash directly to {booking.worker_name || 'Pooja Bisht'} after service verification.
                </p>
              </div>
            )}

            {/* Optional Worker Tip */}
            <div className="space-y-1.5">
              <label className="font-label-md text-xs text-on-surface font-bold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Heart size={14} className="text-secondary fill-secondary" />
                  Direct Worker Tip (100% to {booking.worker_name || 'Pooja'})
                </span>
                <span className="text-[11px] text-secondary font-bold">Zero commission taken</span>
              </label>
              <div className="flex items-center gap-2">
                {TIPS.map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => {
                      setSelectedTip(tip)
                      setCustomTip('')
                    }}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${
                      selectedTip === tip && customTip === ''
                        ? 'border-secondary bg-secondary-container text-on-secondary-container shadow-sm'
                        : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {tip === 0 ? 'No tip' : `₹${tip}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Transparent Split Breakdown */}
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                  Cooperative Split Formula
                </span>
                <span className="font-bold text-primary text-xs">
                  ₹{totalAmount} Total
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-surface-container flex">
                <div className="h-full bg-primary" style={{ width: '90%' }} />
                <div className="h-full bg-secondary-container" style={{ width: '10%' }} />
              </div>
              <div className="flex justify-between text-[10px] font-medium text-on-surface-variant">
                <span className="text-primary font-bold">₹{workerTakeHome} to {booking.worker_name || 'Pooja Bisht'} (90% + tip)</span>
                <span className="text-secondary font-bold">₹{welfareCut} Welfare Fund (10%)</span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0c2340] hover:bg-slate-900 text-white transition shadow-md flex items-center justify-center gap-2 font-label-md text-xs font-extrabold uppercase tracking-wider disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin text-emerald-400" />
                  <span>Processing Razorpay Checkout…</span>
                </>
              ) : (
                <>
                  <Lock size={14} className="text-emerald-400" />
                  <span>Pay ₹{totalAmount} via Razorpay</span>
                </>
              )}
            </button>

            {/* Razorpay Trust Badge Footer */}
            <div className="pt-2 text-center text-[10px] text-on-surface-variant flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-blue-600" />
              <span>Secured by Razorpay Standard Checkout • 256-bit SSL Encrypted</span>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
