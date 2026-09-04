/**
 * Register.jsx — account creation page.
 *
 * WHAT: A two-step form.
 *   Step 1: Choose role — Customer or Worker.
 *   Step 2: Fill in personal details. Workers get extra fields (skills, city).
 *
 * WHY:  Separating role selection onto its own screen makes the choice clear
 *       and keeps the form from looking overwhelming.
 * HOW:  Calls register() from AuthContext which hits POST /api/auth/register.
 *       On success the user is automatically logged in and redirected.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Building2, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { sendOTP, verifyOTP } from '../services/api'
import Logo from '../components/Logo'

const DASHBOARD = {
  customer: '/customer',
  worker:   '/worker',
  cooperative_admin: '/cooperative',
}

// ---------------------------------------------------------------------------
// Step 1 — Choose role
// ---------------------------------------------------------------------------
function RoleStep({ onChoose }) {
  return (
    <div className="card p-8">
      <h1 className="mb-1 font-display text-2xl font-bold text-ink">Create an account</h1>
      <p className="mb-8 text-sm text-muted">I am joining NEED as a…</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <button
          onClick={() => onChoose('customer')}
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-line bg-white p-5 text-center transition hover:border-brand-500 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <User size={24} />
          </div>
          <div>
            <p className="font-display font-bold text-ink text-sm">Customer</p>
            <p className="mt-0.5 text-[11px] text-muted leading-tight">Book services for my home</p>
          </div>
        </button>

        <button
          onClick={() => onChoose('worker')}
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-line bg-white p-5 text-center transition hover:border-brand-500 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-marigold-50 text-marigold-600">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="font-display font-bold text-ink text-sm">Worker Partner</p>
            <p className="mt-0.5 text-[11px] text-muted leading-tight">Offer skills &amp; earn directly</p>
          </div>
        </button>

        <button
          onClick={() => onChoose('cooperative_admin')}
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-line bg-white p-5 text-center transition hover:border-brand-500 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 border border-purple-200">
            <Building2 size={24} />
          </div>
          <div>
            <p className="font-display font-bold text-ink text-sm">Contractor / Coop</p>
            <p className="mt-0.5 text-[11px] text-muted leading-tight">Manage worker team &amp; society</p>
          </div>
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Fill details
// ---------------------------------------------------------------------------
function DetailsStep({ role, onBack, onProceedToOtp, busy, error }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    address: '',
    // Worker extras
    skills: '', experience_years: '', city: '', primary_service: '',
    // Cooperative Admin / Contractor extras
    cooperative_name: '', registration_number: '', service_categories: '',
    accepted_terms: false,
  })
  const [localError, setLocalError] = useState('')

  const set = (key) => (e) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  function validate() {
    if (!form.name.trim())    return 'Name is required'
    if (!form.email.trim())   return 'Email is required'
    if (!form.phone.trim())   return 'Phone number is required'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirm) return 'Passwords do not match'
    if (!form.accepted_terms) return 'Please accept the terms to continue'
    return null
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setLocalError(err); return }
    setLocalError('')
    const { confirm, ...rest } = form
    onProceedToOtp({ ...rest, role })
  }

  const displayError = localError || error

  return (
    <div className="card p-8">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        ← Back
      </button>

      <h1 className="mb-1 font-display text-2xl font-bold text-ink">
        {role === 'worker'
          ? 'Join as a Worker Partner'
          : role === 'cooperative_admin'
          ? 'Register Labour Cooperative / Contractor'
          : 'Join as a Customer'}
      </h1>
      <p className="mb-6 text-sm text-muted">Fill in your details to get started</p>

      {displayError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Common fields */}
        <Field label="Full name / Administrator Name" id="name" type="text" value={form.name}
          onChange={set('name')} placeholder="Riya Sharma" autoComplete="name" />

        <Field label="Email address" id="email" type="email" value={form.email}
          onChange={set('email')} placeholder="riya@example.com" autoComplete="email" />

        <Field label="Phone number" id="phone" type="tel" value={form.phone}
          onChange={set('phone')} placeholder="9876543210" autoComplete="tel" />

        <Field label="Address (optional)" id="address" type="text" value={form.address}
          onChange={set('address')} placeholder="House no., street, city" />

        {/* Worker-only fields */}
        {role === 'worker' && (
          <>
            <Field label="Primary service" id="primary_service" type="text"
              value={form.primary_service} onChange={set('primary_service')}
              placeholder="e.g. Electrician, Plumber" />
            <Field label="Skills (comma-separated)" id="skills" type="text"
              value={form.skills} onChange={set('skills')}
              placeholder="e.g. Wiring, Fan repair" />
            <Field label="Years of experience" id="experience_years" type="number"
              value={form.experience_years} onChange={set('experience_years')}
              placeholder="0" />
            <Field label="City" id="city" type="text"
              value={form.city} onChange={set('city')} placeholder="Noida" />
          </>
        )}

        {/* Contractor / Cooperative Admin fields */}
        {role === 'cooperative_admin' && (
          <>
            <Field label="Labour Union / Contractor Organization Name" id="cooperative_name" type="text"
              value={form.cooperative_name} onChange={set('cooperative_name')}
              placeholder="e.g. Noida Artisans & Electricians Cooperative" />
            <Field label="Society / Licence Registration Number (Optional)" id="registration_number" type="text"
              value={form.registration_number} onChange={set('registration_number')}
              placeholder="e.g. COOP-UP-2026-901" />
            <Field label="City / Operating Region" id="city" type="text"
              value={form.city} onChange={set('city')} placeholder="Noida & Greater Noida" />
            <Field label="Service Categories Provided" id="service_categories" type="text"
              value={form.service_categories} onChange={set('service_categories')}
              placeholder="e.g. Electrician, Plumber, AC Repair" />
          </>
        )}

        <Field label="Password" id="password" type="password" value={form.password}
          onChange={set('password')} placeholder="Min. 6 characters" autoComplete="new-password" />

        <Field label="Confirm password" id="confirm" type="password" value={form.confirm}
          onChange={set('confirm')} placeholder="••••••••" autoComplete="new-password" />

        <label className="flex items-start gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.accepted_terms}
            onChange={set('accepted_terms')}
            className="mt-0.5 accent-brand-600"
          />
          <span>
            I agree to the{' '}
            <Link to="/about" className="text-brand-600 hover:underline">
              terms and conditions
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="btn btn-primary w-full disabled:opacity-60"
        >
          {busy ? 'Sending OTP…' : 'Continue to Phone OTP Verification →'}
        </button>
      </form>
    </div>
  )
}

// Reusable labelled input
function Field({ label, id, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        required
        className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Mandatory OTP Verification
// ---------------------------------------------------------------------------
function OtpStep({ phone, onVerifyAndSubmit, onBack, busy, error }) {
  const [otpCode, setOtpCode] = useState('')
  const [demoOtp, setDemoOtp] = useState('')
  const [localError, setLocalError] = useState('')
  const [sentMsg, setSentMsg] = useState('')
  const [sending, setSending] = useState(false)

  // Auto-trigger OTP send when entering Step 3
  const triggerSend = async () => {
    setSending(true)
    setLocalError('')
    try {
      const res = await sendOTP(phone, 'mobile')
      setDemoOtp(res.demo_otp || '123456')
      setSentMsg(`OTP sent to +91 ${phone}! Demo OTP: ${res.demo_otp || '123456'}`)
    } catch (err) {
      setLocalError('Failed to send OTP to mobile. Please try again.')
    } finally {
      setSending(false)
    }
  }

  // Initial send on component mount
  useState(() => {
    triggerSend()
  })

  async function handleConfirm(e) {
    e.preventDefault()
    if (!otpCode.trim() || otpCode.length < 4) {
      setLocalError('Please enter the 6-digit OTP code')
      return
    }
    setLocalError('')

    try {
      await verifyOTP(phone, 'mobile', otpCode)
      onVerifyAndSubmit()
    } catch (err) {
      setLocalError(err?.response?.data?.error || 'Invalid or expired OTP. Try 123456.')
    }
  }

  const displayError = localError || error

  return (
    <div className="card p-8">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        ← Back to Details
      </button>

      <h1 className="mb-1 font-display text-2xl font-bold text-ink">Verify Mobile Number</h1>
      <p className="mb-6 text-sm text-muted">
        We sent a 6-digit verification OTP code to <strong className="text-ink">+91 {phone}</strong>
      </p>

      {displayError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {displayError}
        </div>
      )}

      {sentMsg && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-xs text-emerald-800 font-medium">
          {sentMsg}
        </div>
      )}

      <form onSubmit={handleConfirm} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Enter 6-Digit OTP</label>
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
            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-900 font-mono">
              🔑 Demo Auto-Generated OTP: <strong>{demoOtp}</strong>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={triggerSend}
            disabled={sending || busy}
            className="btn btn-secondary flex-1 py-2.5 text-xs"
          >
            {sending ? 'Sending…' : 'Resend OTP'}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary flex-[2] py-2.5 text-xs font-bold disabled:opacity-60"
          >
            {busy ? 'Verifying & Registering…' : 'Confirm OTP & Complete Signup ✓'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [step,  setStep]  = useState(1)       // 1 = role choice, 2 = details, 3 = OTP
  const [role,  setRole]  = useState(null)
  const [formData, setFormData] = useState(null)
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState('')

  function chooseRole(r) {
    setRole(r)
    setStep(2)
  }

  function handleProceedToOtp(data) {
    setFormData(data)
    setStep(3)
  }

  async function handleFinalRegister() {
    if (!formData) return
    setError('')
    setBusy(true)
    try {
      const user = await register({
        ...formData,
        is_mobile_verified: true,
      })
      navigate(DASHBOARD[user.role] || '/', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.error || 'Something went wrong during registration.'
      setError(msg)
      setStep(2) // return to details if registration fails
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {step === 1 && (
          <RoleStep onChoose={chooseRole} />
        )}

        {step === 2 && (
          <DetailsStep
            role={role}
            onBack={() => setStep(1)}
            onProceedToOtp={handleProceedToOtp}
            busy={busy}
            error={error}
          />
        )}

        {step === 3 && formData && (
          <OtpStep
            phone={formData.phone}
            onVerifyAndSubmit={handleFinalRegister}
            onBack={() => setStep(2)}
            busy={busy}
            error={error}
          />
        )}
      </div>
    </div>
  )
}
