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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm"
        onClick={busy ? undefined : onClose}
      />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/60 z-10 my-8 animate-fade-in">
        {/* Tactile Header */}
        <div className="bg-inverse-surface text-inverse-on-surface px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-[18px]">payments</span>
            <span className="font-label-caps text-[11px] tracking-wider text-secondary-fixed uppercase font-bold">
              Direct Cooperative Remittance
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="text-inverse-on-surface/70 hover:text-inverse-on-surface p-1 rounded-lg hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title Bar */}
        <div className="p-5 border-b border-outline-variant/40 bg-surface-container-low flex items-center justify-between">
          <div>
            <span className="font-label-caps text-[10px] uppercase text-primary font-bold">
              Booking Ref #{booking.id}
            </span>
            <h2 className="font-headline-sm text-lg text-on-surface font-extrabold">
              {booking.service_name || 'Service Task'}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase">Payable</span>
            <div className="font-metric-val text-xl text-primary font-extrabold leading-tight">
              ₹{totalAmount}
            </div>
          </div>
        </div>

        {/* Payment Success Splash */}
        {completedPayment ? (
          <div className="p-7 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="font-headline-md text-xl font-extrabold text-on-surface">Payment Settled!</h3>
              <p className="font-mono text-xs text-primary font-bold mt-1">
                Official Receipt: {completedPayment.invoice_id}
              </p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between font-bold text-on-surface">
                <span>Total Remitted:</span>
                <span className="font-mono">₹{completedPayment.total_amount}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Payment Mode:</span>
                <span className="font-mono uppercase">{method} (Simulated)</span>
              </div>
              <div className="border-t border-primary/20 pt-2 flex justify-between text-primary font-bold">
                <span>Welfare Contribution:</span>
                <span className="font-mono">₹{completedPayment.welfare_contribution}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full btn btn-primary font-bold text-xs uppercase tracking-wider shadow-sm"
            >
              Done • Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={16} className="text-error shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="font-label-md text-xs text-on-surface font-bold flex items-center justify-between">
                <span>Select Payment Mode</span>
                <span className="text-[10px] text-primary font-bold">100% Encrypted &amp; Secure</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'upi'
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm ring-2 ring-primary/20'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <Smartphone size={20} className="text-primary" />
                  <span className="text-xs font-semibold">UPI Apps</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('qr')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'qr'
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm ring-2 ring-primary/20'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <QrCode size={20} className="text-emerald-600" />
                  <span className="text-xs font-semibold">Scan QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'card'
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm ring-2 ring-primary/20'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <CreditCard size={20} className="text-primary" />
                  <span className="text-xs font-semibold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('cash')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'cash'
                      ? 'border-secondary bg-secondary-container/30 text-secondary font-bold shadow-sm ring-2 ring-secondary/20'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <Banknote size={20} className="text-amber-600" />
                  <span className="text-xs font-semibold">Cash</span>
                </button>
              </div>
            </div>

            {/* Dynamic Method Details */}
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
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-mono font-medium text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            )}

            {method === 'qr' && (
              <div className="p-4 rounded-xl bg-surface-container-low text-center space-y-3 border border-outline-variant/40 animate-fade-in">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-xs text-on-surface">Scan &amp; Pay via Any UPI App</span>
                  <span className="bg-emerald-500/10 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live Dynamic QR
                  </span>
                </div>

                <div className="mx-auto w-44 h-44 bg-white p-2.5 rounded-2xl shadow-lg border border-outline-variant/60 flex flex-col items-center justify-center relative group">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=thakuraayush@fam&pn=Aayush%20Thakur&am=${totalAmount}&cu=INR&tn=NEEDRef${booking.id}`)}`}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <span className="absolute -bottom-2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-md font-mono">
                    Pay ₹{totalAmount}
                  </span>
                </div>

                <div className="pt-2 text-xs space-y-1">
                  <div className="font-mono text-on-surface">
                    UPI ID: <span className="font-bold text-primary font-mono">thakuraayush@fam</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Open PhonePe, GPay, Paytm or BHIM to scan &amp; complete payment.
                  </p>
                </div>
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
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-mono font-medium text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-mono font-medium text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="CVV"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-mono font-medium text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
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
                  Pay ₹{totalAmount} in cash directly to the assigned member worker after service verification.
                </p>
              </div>
            )}

            {/* Optional Worker Tip */}
            <div className="space-y-1.5">
              <label className="font-label-md text-xs text-on-surface font-bold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Heart size={14} className="text-secondary fill-secondary" />
                  Direct Worker Tip (100% to Worker)
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
                <span className="text-primary font-bold">₹{workerTakeHome} Direct to Worker (90% + tip)</span>
                <span className="text-secondary font-bold">₹{welfareCut} Welfare Fund (10%)</span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition shadow-md flex items-center justify-center gap-2 font-label-md text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing Remittance…</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Simulate Payment &amp; Remit (₹{totalAmount})</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
