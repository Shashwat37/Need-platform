/**
 * Login.jsx — the sign-in page.
 *
 * WHAT: Email + password form. On success, redirects to the user's dashboard.
 * WHY:  After authentication every dashboard becomes accessible.
 * HOW:  Calls login() from AuthContext which hits POST /api/auth/login.
 *       The `from` location is passed by ProtectedRoute so we can send the
 *       user back to where they were trying to go.
 */

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import Logo from '../components/Logo'

// Where each role lands after login.
const DASHBOARD = {
  customer: '/customer',
  worker:   '/worker',
  cooperative_admin: '/cooperative',
  admin:    '/admin',
}

export default function Login() {
  const { login } = useAuth()
  const { t }     = useLanguage()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      const user = await login(email, password)
      // Go back to where they were trying to go, or their dashboard.
      const destination = location.state?.from?.pathname || DASHBOARD[user.role] || '/'
      navigate(destination, { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.error || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="card p-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-ink">{t('login_title', 'Welcome back')}</h1>
          <p className="mb-6 text-sm text-muted">{t('login_subtitle', 'Log in to your NEED account')}</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
                {t('email_address', 'Email address')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
                {t('password', 'Password')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full disabled:opacity-60"
            >
              {busy ? 'Logging in…' : t('login_button', 'Log in')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:underline">
              Register
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-6 rounded-xl border border-line bg-paper p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Demo accounts
            </p>
            <div className="space-y-1 font-mono text-xs text-ink">
              <p><span className="text-muted">Customer:</span> ananya@example.com</p>
              <p><span className="text-muted">Worker:</span>   rahul@example.com</p>
              <p><span className="text-muted">Admin:</span>    admin@need.in</p>
              <p className="mt-1 text-muted">Password: <span className="text-ink">demo123</span> (admin: admin123)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
