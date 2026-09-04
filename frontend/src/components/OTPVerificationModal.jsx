import { useState } from 'react'
import { CheckCircle2, KeyRound, Loader2, Mail, Phone, ShieldCheck, X } from 'lucide-react'
import { sendOTP, verifyOTP } from '../services/api'

/**
 * OTPVerificationModal.jsx — Interactive Verification Suite.
 *
 * Supports 3 Verification Modes:
 *  1. Mobile Phone Number OTP (📱)
 *  2. Email Address OTP (✉️)
 *  3. Govt Aadhaar Identity Verification OTP (🪪)
 */
export default function OTPVerificationModal({
  isOpen,
  onClose,
  initialMode = 'mobile', // 'mobile' | 'email' | 'aadhaar'
  userPhone = '',
  userEmail = '',
  userAadhaar = '',
  onSuccess,
}) {
  const [mode, setMode] = useState(initialMode) // 'mobile' | 'email' | 'aadhaar'
  const [step, setStep] = useState(1) // 1 = Input target, 2 = Enter 6-digit OTP

  const [targetInput, setTargetInput] = useState(() => {
    if (initialMode === 'email') return userEmail
    if (initialMode === 'aadhaar') return userAadhaar
    return userPhone
  })
  const [otpCode, setOtpCode] = useState('')
  const [demoOtp, setDemoOtp] = useState('')
  
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  function switchMode(newMode) {
    setMode(newMode)
    setStep(1)
    setError('')
    setSuccessMsg('')
    setOtpCode('')
    setDemoOtp('')
    if (newMode === 'email') setTargetInput(userEmail)
    else if (newMode === 'aadhaar') setTargetInput(userAadhaar)
    else setTargetInput(userPhone)
  }

  async function handleSendOTP(e) {
    if (e) e.preventDefault()
    if (!targetInput.trim()) {
      setError(`Please enter a valid ${mode === 'aadhaar' ? 'Aadhaar number' : mode}`)
      return
    }
    setError('')
    setSuccessMsg('')
    setBusy(true)

    try {
      const res = await sendOTP(targetInput, mode)
      setDemoOtp(res.demo_otp || '123456')
      setSuccessMsg(`OTP sent successfully! Demo OTP: ${res.demo_otp || '123456'}`)
      setStep(2)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to send OTP. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleVerifyOTP(e) {
    if (e) e.preventDefault()
    if (!otpCode.trim() || otpCode.length < 4) {
      setError('Please enter the 6-digit OTP code')
      return
    }
    setError('')
    setSuccessMsg('')
    setBusy(true)

    try {
      const res = await verifyOTP(
        targetInput,
        mode,
        otpCode,
        mode === 'aadhaar' ? targetInput : ''
      )
      setSuccessMsg(res.message || 'Verification completed successfully!')
      if (onSuccess) onSuccess(res.user)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid or expired OTP code.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md overflow-hidden p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">OTP Verification</h2>
              <p className="text-xs text-muted">Secure Multi-Factor Identity Check</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mb-6 flex rounded-xl border border-line bg-slate-50 p-1">
          <button
            onClick={() => switchMode('mobile')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              mode === 'mobile'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Phone size={14} /> Mobile
          </button>

          <button
            onClick={() => switchMode('email')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              mode === 'email'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Mail size={14} /> Email
          </button>

          <button
            onClick={() => switchMode('aadhaar')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              mode === 'aadhaar'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <ShieldCheck size={14} /> Aadhaar
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 font-medium">
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}

        {/* Step 1 — Input target number / email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink">
                {mode === 'mobile'
                  ? 'Mobile Phone Number'
                  : mode === 'email'
                  ? 'Email Address'
                  : '12-Digit Govt Aadhaar Number'}
              </label>
              <div className="relative">
                <input
                  type={mode === 'email' ? 'email' : 'text'}
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder={
                    mode === 'mobile'
                      ? '9876543210'
                      : mode === 'email'
                      ? 'you@example.com'
                      : 'XXXX XXXX 1234'
                  }
                  required
                  className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              {mode === 'aadhaar' && (
                <p className="mt-1 text-[11px] text-muted">
                  Official UIDAI sandbox integration. Instant verification with 6-digit OTP.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending OTP…
                </>
              ) : (
                <>
                  <KeyRound size={16} /> Get Verification OTP
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2 — Enter 6-digit OTP code */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-ink">Enter 6-Digit OTP</label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] font-medium text-brand-600 hover:underline"
                >
                  Change {mode}
                </button>
              </div>

              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                autoFocus
                required
                className="w-full rounded-xl border-2 border-brand-500 bg-white px-4 py-3 text-center font-mono text-xl font-bold tracking-[0.3em] text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {demoOtp && (
                <div className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-center text-xs text-amber-800 font-mono">
                  🔑 Demo OTP Auto-Generated: <strong>{demoOtp}</strong>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={busy}
                className="btn btn-secondary flex-1 py-2.5 text-xs"
              >
                Resend OTP
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary flex-[2] flex items-center justify-center gap-2 py-2.5 text-xs font-bold"
              >
                {busy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Verifying…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Confirm &amp; Verify
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
