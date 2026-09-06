/**
 * PaymentModal.jsx — Authentic Razorpay Standard Checkout UI (Saddam Kassim Tutorial Reference).
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Globe,
  Heart,
  Loader2,
  Lock,
  QrCode,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
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
  const [selectedBank, setSelectedBank] = useState('sbi')

  const [busy, setBusy]               = useState(false)
  const [error, setError]             = useState('')
  const [completedPayment, setCompletedPayment] = useState(null)
  
  // 10-Minute Dynamic Session Countdown Timer (600 seconds)
  const [timeLeft, setTimeLeft]       = useState(600)

  // Smart Local Dev Auto-Confirmation Timer (5 seconds on QR tab)
  const [autoTimerSeconds, setAutoTimerSeconds] = useState(5)
  const [autoTimerActive, setAutoTimerActive]   = useState(true)

  // Dynamic Worker Payout & Escrow Calculations (must be declared before useEffect dependency evaluation)
  const workerUpiId = booking?.worker_upi_id || 'thakuraayush@fam'
  const workerName = booking?.worker_account_holder || booking?.worker_name || 'Pooja Bisht'
  const workerBankAccount = booking?.worker_bank_account || '919876543210'
  const workerBankIfsc = booking?.worker_bank_ifsc || 'PUNB0123400'

  const totalBookingAmount = booking?.amount || 299
  const convenienceFee = booking?.convenience_fee ?? 20
  const protectionFee = booking?.protection_fee ?? (booking?.has_protection ? 25 : 0)
  const baseServiceAmount = booking?.base_service_amount ?? Math.max(0, totalBookingAmount - convenienceFee - protectionFee)
  const tipAmount     = customTip !== '' ? Math.max(0, Number(customTip) || 0) : selectedTip
  const totalAmount   = totalBookingAmount + tipAmount

  // Charges & Deductions Breakdown (based on base service amount)
  const platformFee   = Math.round(baseServiceAmount * 0.05)
  const welfareCut    = Math.round(baseServiceAmount * 0.10)
  const workerNetEarned = Math.round(baseServiceAmount * 0.85 + tipAmount)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  const timerPercentage = (timeLeft / 600) * 100

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

  // 2. Real-time Status Polling (Every 1.5 Seconds for webhook detection)
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
    }, 1500)

    return () => clearInterval(pollInterval)
  }, [isOpen, completedPayment, booking?.id])

  if (!isOpen || !booking) return null

  async function handlePay(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (timeLeft === 0) {
      setError('Payment session expired. Please reset the timer to proceed.')
      return
    }

    setError('')
    setBusy(true)

    try {
      const payload = {
        booking_id: booking.id,
        method:     method === 'qr' ? 'upi' : method,
        tip_amount: tipAmount,
        upi_id:     upiId || workerUpiId,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-[#071325]/75 backdrop-blur-sm transition-opacity"
        onClick={busy ? undefined : onClose}
      />

      {/* Razorpay Standard Checkout Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 my-6 animate-fade-in">
        
        {/* Authentic Razorpay Dark Navy Header (#0c2340) */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            {/* Razorpay Official Logo Icon */}
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md border border-blue-400/30">
              <span className="font-mono tracking-tighter italic">rzp</span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-blue-300 uppercase tracking-widest font-extrabold">
                <span>Razorpay Standard Checkout</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h2 className="font-headline-sm text-base font-extrabold text-white tracking-tight">
                NEED Federation Gateway
              </h2>
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            <div>
              <span className="text-[10px] font-mono text-blue-300 uppercase block font-bold">Order Amount</span>
              <div className="font-mono text-2xl text-emerald-400 font-black leading-none pt-0.5">
                ₹{totalAmount}
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={busy}
              className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 10-Minute Dynamic Session Timer Band */}
        <div className="bg-[#071930] text-white px-5 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock size={15} className={timeLeft < 120 ? 'text-red-400 animate-bounce' : 'text-amber-400'} />
            <span className="font-mono font-bold text-slate-200">
              Payment Timer: <span className={`font-black ${timeLeft < 120 ? 'text-red-400' : 'text-amber-400'}`}>{formattedTime}</span>
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

        {/* Beneficiary Artisan Remittance Banner */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-5 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-blue-700 shrink-0" />
            <span className="text-slate-800 font-medium">
              Direct Beneficiary: <strong className="text-blue-900 font-bold">{workerName}</strong>
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
            {workerUpiId}
          </span>
        </div>

        {/* Payment Success Splash Screen */}
        {completedPayment ? (
          <div className="p-8 text-center space-y-6 animate-scale-up relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-white to-white">
            {/* Razorpay Success Badge */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xl border-4 border-white">
                <CheckCircle2 size={48} className="animate-bounce" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-300">
                <Sparkles size={14} className="text-emerald-600" />
                Razorpay Payment Successful
              </div>
              <h3 className="font-headline-lg text-2xl font-black text-slate-900 pt-1">
                ₹{completedPayment.total_amount || totalAmount} Paid!
              </h3>
              <p className="font-mono text-xs text-slate-500">
                Razorpay Payment ID: <span className="font-bold text-blue-900 font-mono">{completedPayment.invoice_id}</span>
              </p>
            </div>

            {/* Remittance Confirmation Box */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs space-y-2 text-left shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-200 font-bold text-emerald-900">
                <span>Remittance Status:</span>
                <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  Transferred to {workerUpiId} ✅
                </span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1">
                <span>Base Service Amount:</span>
                <span className="font-mono font-bold text-slate-900">₹{baseServiceAmount}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Convenience Fee:</span>
                <span className="font-mono text-slate-900">₹{convenienceFee}</span>
              </div>
              {protectionFee > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Customer Protection Plan:</span>
                  <span className="font-mono text-emerald-700 font-bold">₹{protectionFee} (Active)</span>
                </div>
              )}
              {tipAmount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Artisan Tip:</span>
                  <span className="font-mono text-slate-900">+₹{tipAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700 pt-1 border-t border-emerald-200/60">
                <span>Total Paid:</span>
                <span className="font-mono font-bold text-slate-900">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-900 pt-2 border-t border-emerald-200">
                <span className="font-bold text-emerald-900">Net Take-Home to {workerName} (85% + Tip):</span>
                <span className="font-mono font-black text-emerald-700 text-sm">₹{workerNetEarned}</span>
              </div>
            </div>

            <div className="pt-2">
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
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center space-y-2">
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
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Razorpay Method Tabs Header */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 font-bold flex items-center justify-between">
                <span>Select Payment Method</span>
                <span className="text-[10px] text-blue-700 font-mono font-bold">Razorpay Recommended</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('qr')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'qr'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <QrCode size={20} className="text-blue-700" />
                  <span className="text-xs font-bold">UPI QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'upi'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone size={20} className="text-blue-700" />
                  <span className="text-xs font-bold">UPI VPA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'card'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard size={20} className="text-blue-700" />
                  <span className="text-xs font-bold">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('cash')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    method === 'cash'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-sm ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Banknote size={20} className="text-amber-600" />
                  <span className="text-xs font-bold">Cash</span>
                </button>
              </div>
            </div>

            {/* Dynamic Method View */}
            {method === 'qr' && (
              <div className="p-4 rounded-2xl bg-slate-50 text-center space-y-3 border border-slate-200 animate-fade-in">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold text-xs text-slate-800">Scan QR Code via PhonePe / GPay / Paytm</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
                    Live Dynamic QR
                  </span>
                </div>

                <div className="mx-auto w-48 h-48 bg-white p-2.5 rounded-2xl shadow-md border border-slate-300 flex flex-col items-center justify-center relative group">
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
                  <div className="font-mono text-slate-700">
                    Direct Beneficiary: <strong className="text-emerald-800 font-mono">{workerUpiId}</strong> ({workerName})
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 space-y-1">
                    <div className="text-[11px] text-blue-900 font-bold flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>⚡ Waiting for Payment Confirmation</span>
                    </div>
                    <p className="text-[10px] text-blue-700 font-mono">
                      Scan QR &amp; complete payment on GPay/PhonePe, then click button below to confirm!
                    </p>
                  </div>

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
                          <span>Verifying &amp; Confirming UPI Transfer...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>I Have Completed Payment on PhonePe / GPay ⚡</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div className="p-3.5 rounded-xl bg-slate-50 space-y-2.5 border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Enter VPA / UPI ID</span>
                  <span className="text-[10px] text-blue-700 font-bold">GPay / PhonePe / Paytm / BHIM</span>
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder={workerUpiId || 'thakuraayush@fam'}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            )}

            {method === 'card' && (
              <div className="p-3.5 rounded-xl bg-slate-50 space-y-2.5 border border-slate-200">
                <span className="font-bold text-xs text-slate-800 block">Credit / Debit Card</span>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card Number"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="CVV"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {method === 'cash' && (
              <div className="p-3.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Banknote size={16} />
                  Cash After Service Handover
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Pay ₹{totalAmount} in cash directly to {workerName} after service verification.
                </p>
              </div>
            )}

            {/* Optional Worker Tip */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Heart size={14} className="text-pink-600 fill-pink-600" />
                  Direct Worker Tip (100% to {workerName})
                </span>
                <span className="text-[11px] text-slate-500 font-bold">Zero commission taken</span>
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
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tip === 0 ? 'No tip' : `₹${tip}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Itemized Fee Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Itemized Fee Breakdown
                </span>
                <span className="font-black text-slate-900 text-xs">
                  ₹{totalAmount} Total
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex justify-between text-slate-600">
                  <span>Base Service Fare:</span>
                  <span className="font-mono">₹{baseServiceAmount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Convenience Fee:</span>
                  <span className="font-mono text-blue-700 font-medium">+₹{convenienceFee}</span>
                </div>
                {protectionFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Customer Protection Plan:</span>
                    <span className="font-mono text-emerald-700 font-medium">+₹{protectionFee}</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>100% Direct Tip:</span>
                    <span className="font-mono">+₹{tipAmount}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-emerald-800 text-xs">
                  <span>Net Take-Home to {workerName} (85% + Tip):</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">₹{workerNetEarned}</span>
                </div>
              </div>
            </div>

            {/* Primary Action Submit */}
            <button
              type="submit"
              disabled={busy || timeLeft === 0}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0c2340] hover:bg-slate-900 text-white transition shadow-md flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider disabled:opacity-50"
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

            {/* Official Razorpay Footer */}
            <div className="pt-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1 font-mono">
              <ShieldCheck size={13} className="text-blue-700" />
              <span>Secured by Razorpay Standard Checkout • 256-bit SSL Encrypted</span>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
