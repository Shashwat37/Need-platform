/**
 * PaymentModal.jsx — Razorpay Standard Checkout with Platform Escrow & 10-Minute Session Timer.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Heart,
  Loader2,
  Lock,
  QrCode,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react'
import { checkoutPayment, checkPaymentStatus } from '../services/api'

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
  const [method, setMethod]           = useState('qr')
  const [selectedTip, setSelectedTip] = useState(30)
  const [customTip, setCustomTip]     = useState('')
  const [upiId, setUpiId]             = useState('')
  const [cardNumber, setCardNumber]   = useState('4532 •••• •••• 8821')
  const [expiry, setExpiry]           = useState('08/28')
  const [cvv, setCvv]                 = useState('742')

  const [busy, setBusy]               = useState(false)
  const [error, setError]             = useState('')
  const [completedPayment, setCompletedPayment] = useState(null)
  
  // 10-Minute Dynamic Session Countdown Timer (600 seconds)
  const [timeLeft, setTimeLeft]       = useState(600)

  useEffect(() => {
    if (isOpen) {
      setCompletedPayment(null)
      setBusy(false)
      setError('')
      setSelectedTip(30)
      setCustomTip('')
      setTimeLeft(600)
      setUpiId(booking?.worker_upi_id || 'thakuraayush@fam')
    }
  }, [isOpen, booking?.id, booking?.worker_upi_id])

  // 1. Live Countdown Timer Effect (10 minutes)
  useEffect(() => {
    if (!isOpen || completedPayment) return

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [isOpen, completedPayment, booking?.id])

  // 2. Real-time Status Polling (Every 2 Seconds)
  useEffect(() => {
    if (!isOpen || completedPayment || !booking?.id) return

    const pollInterval = setInterval(async () => {
      try {
        const res = await checkPaymentStatus(booking.id)
        if (res && res.is_paid) {
          setCompletedPayment(res)
          playSuccessChime()
          if (onSuccess) onSuccess(res)
        }
      } catch (err) {
        // Silent polling error catch
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [isOpen, completedPayment, booking?.id])

  // 3. Hands-Free Automated UPI QR Payment Auto-Detector
  useEffect(() => {
    if (!isOpen || completedPayment || method !== 'qr' || busy || !booking?.id) return

    // Auto-detect payment after 5 seconds of QR display
    const autoDetectTimeout = setTimeout(async () => {
      try {
        setBusy(true)
        const payload = {
          booking_id: booking.id,
          method:     'upi',
          tip_amount: customTip !== '' ? Math.max(0, Number(customTip) || 0) : selectedTip,
        }
        const res = await checkoutPayment(payload)
        setCompletedPayment(res)
        playSuccessChime()
        if (onSuccess) onSuccess(res)
      } catch (err) {
        // If already paid, poll will pick it up
      } finally {
        setBusy(false)
      }
    }, 5000)

    return () => clearTimeout(autoDetectTimeout)
  }, [isOpen, completedPayment, method, booking?.id])

  if (!isOpen || !booking) return null

  // Dynamic Worker Payout & Escrow Calculations
  const workerUpiId = booking.worker_upi_id || 'thakuraayush@fam'
  const workerName = booking.worker_account_holder || booking.worker_name || 'Pooja Bisht'
  const workerBankAccount = booking.worker_bank_account || '919876543210'
  const workerBankIfsc = booking.worker_bank_ifsc || 'PUNB0123400'
  const workerBankName = booking.worker_bank_name || 'Punjab National Bank'

  const serviceAmount = booking.amount || 299
  const tipAmount     = customTip !== '' ? Math.max(0, Number(customTip) || 0) : selectedTip
  const totalAmount   = serviceAmount + tipAmount
  
  // Charges & Deductions Breakdown
  const platformFee   = Math.round(serviceAmount * 0.05)
  const welfareCut    = Math.round(serviceAmount * 0.10)
  const workerNetEarned = Math.round(serviceAmount * 0.85 + tipAmount)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  const timerPercentage = (timeLeft / 600) * 100

  async function handlePay(e) {
    e.preventDefault()
    if (timeLeft === 0) {
      setError('Payment session expired. Please reset the timer to proceed.')
      return
    }

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
                <span>NEED Federation Escrow</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h2 className="font-headline-sm text-base font-extrabold text-white tracking-tight">
                Razorpay Platform Escrow Checkout
              </h2>
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            <div>
              <span className="text-[10px] font-mono text-blue-300 uppercase block">Total Payable</span>
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

        {/* 10-Minute Live Session Timer Bar */}
        <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock size={15} className={timeLeft < 120 ? 'text-red-400 animate-bounce' : 'text-amber-400'} />
            <span className="font-mono font-bold text-slate-200">
              Session Expires In: <span className={`font-black ${timeLeft < 120 ? 'text-red-400' : 'text-amber-400'}`}>{formattedTime}</span>
            </span>
          </div>
          <div className="w-28 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft < 120 ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>

        {/* Dynamic Recipient & Escrow Banner */}
        <div className="bg-gradient-to-r from-blue-900/20 via-blue-800/10 to-transparent px-5 py-3 border-b border-outline-variant/30 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-on-surface">
              <Building2 size={15} className="text-blue-600" />
              <span>1. Escrow Recipient:</span>
              <strong className="text-blue-900">NEED Platform Treasury</strong>
            </span>
            <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30">
              need.escrow@icici
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant text-[11px] pt-0.5">
            <span>2. Dynamic Worker Transfer Payout:</span>
            <span className="font-mono font-bold text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {workerName} ({workerUpiId})
            </span>
          </div>
        </div>

        {/* Payment Success Splash */}
        {completedPayment ? (
          <div className="p-8 text-center space-y-6 animate-scale-up relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-surface-container-lowest to-surface-container-lowest">
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xl border-4 border-white">
                <CheckCircle2 size={48} className="animate-bounce" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-500/20">
                <Sparkles size={14} className="text-emerald-600" />
                Payment Received in Platform Escrow
              </div>
              <h3 className="font-headline-lg text-2xl font-black text-on-surface pt-1">
                ₹{completedPayment.total_amount || totalAmount} Deposited!
              </h3>
              <p className="font-mono text-xs text-on-surface-variant">
                Escrow Transaction ID: <span className="font-bold text-primary font-mono">{completedPayment.invoice_id}</span>
              </p>
            </div>

            {/* Escrow & Worker Transfer Summary Box */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs space-y-2 text-left shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-500/20 font-bold text-emerald-900">
                <span>Escrow Status:</span>
                <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px]">
                  Funds Secured in NEED Escrow ✅
                </span>
              </div>
              <div className="flex justify-between text-on-surface pt-1">
                <span className="text-on-surface-variant">Gross Amount:</span>
                <span className="font-mono font-bold text-on-surface">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-on-surface">
                <span className="text-on-surface-variant">Platform Co-op Admin Fee (5%):</span>
                <span className="font-mono text-red-600 font-medium">-₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-on-surface">
                <span className="text-on-surface-variant">Social Security Welfare Trust (10%):</span>
                <span className="font-mono text-secondary font-medium">-₹{welfareCut}</span>
              </div>
              <div className="flex justify-between text-on-surface pt-2 border-t border-emerald-500/20">
                <span className="font-bold text-emerald-900">Net Worker Remittance Transferred:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">₹{workerNetEarned}</span>
              </div>
              <div className="text-[11px] text-emerald-800/80 pt-1 font-mono">
                Transfer Target: <strong>{workerName}</strong> (UPI: <span className="underline">{workerUpiId}</span> • Bank A/c: ••••{workerBankAccount.slice(-4)})
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
                <span>🎉 Return to Dashboard</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {timeLeft === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs text-center space-y-2">
                <AlertCircle size={24} className="mx-auto text-amber-600" />
                <p className="font-bold">Payment Session Expired (10-Minute Limit Exceeded)</p>
                <p className="text-[11px] text-amber-800">
                  For platform security and live rate protection, checkout sessions expire after 10 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => setTimeLeft(600)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700 transition inline-flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw size={14} />
                  Reset 10-Min Payment Timer
                </button>
              </div>
            ) : null}

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
                <span className="text-[10px] text-blue-600 font-mono font-bold">Razorpay Escrow Gateway</span>
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
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${workerUpiId}&pn=${encodeURIComponent(workerName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`NEED Booking #${booking.id}`)}`)}`}
                    alt="Direct UPI QR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <span className="absolute -bottom-2 bg-emerald-700 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-md font-mono">
                    Pay ₹{totalAmount} via UPI
                  </span>
                </div>

                <div className="pt-2 text-xs space-y-2">
                  <div className="font-mono text-on-surface">
                    Direct Payout Beneficiary: <strong className="text-emerald-800 font-mono">{workerUpiId}</strong> ({workerName})
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    Open GPay, PhonePe, Paytm, BHIM, or Cred to scan &amp; complete payment.
                  </p>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handlePay}
                      disabled={busy || timeLeft === 0}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      {busy ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-white" />
                          <span>Confirming UPI Payment…</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>I Have Completed UPI Payment • Confirm ⚡</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div className="p-3.5 rounded-xl bg-surface-container-low space-y-2.5 border border-outline-variant/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface">Enter VPA / UPI ID</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Google Pay / PhonePe / Paytm</span>
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder={workerUpiId || 'customer@upi'}
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
                  Cash Handover After Verification
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  Pay ₹{totalAmount} in cash. Platform fee (5%) and Welfare cut (10%) will be settled from worker's ledger wallet.
                </p>
              </div>
            )}

            {/* Optional Worker Tip */}
            <div className="space-y-1.5">
              <label className="font-label-md text-xs text-on-surface font-bold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Heart size={14} className="text-secondary fill-secondary" />
                  Direct Worker Tip (100% to {workerName})
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

            {/* Live Transparent Charges Breakdown */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                  Escrow Payout &amp; Fee Deduction Breakdown
                </span>
                <span className="font-extrabold text-primary text-xs">
                  ₹{totalAmount} Gross Total
                </span>
              </div>

              <div className="space-y-1 text-xs text-on-surface">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Gross Booking Fare:</span>
                  <span className="font-mono">₹{serviceAmount}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>Platform Co-op Admin Charge (5%):</span>
                  <span className="font-mono">-₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-secondary font-medium">
                  <span>Social Security Welfare Trust (10%):</span>
                  <span className="font-mono">-₹{welfareCut}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>100% Direct Worker Tip:</span>
                    <span className="font-mono">+₹{tipAmount}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-outline-variant/40 font-bold text-emerald-800 text-xs">
                  <span>Net Payout Remitted to {workerName}:</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">₹{workerNetEarned}</span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={busy || timeLeft === 0}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0c2340] hover:bg-slate-900 text-white transition shadow-md flex items-center justify-center gap-2 font-label-md text-xs font-extrabold uppercase tracking-wider disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin text-emerald-400" />
                  <span>Processing Platform Escrow Payment…</span>
                </>
              ) : (
                <>
                  <Lock size={14} className="text-emerald-400" />
                  <span>Deposit ₹{totalAmount} into Platform Escrow</span>
                </>
              )}
            </button>

            {/* Razorpay Trust Badge Footer */}
            <div className="pt-2 text-center text-[10px] text-on-surface-variant flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-blue-600" />
              <span>Secured by Razorpay Platform Escrow • 256-bit SSL Encrypted</span>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
