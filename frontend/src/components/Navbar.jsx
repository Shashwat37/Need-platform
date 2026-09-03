import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Globe, LogOut, Menu, User, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import Logo from './Logo'

const LINKS = [
  { to: '/services',     labelKey: 'nav_services',     fallback: 'Services' },
  { to: '/cooperatives', labelKey: 'nav_cooperatives', fallback: 'Cooperatives' },
  { to: '/about',        labelKey: 'nav_about',        fallback: 'Cooperative Model' },
  { to: '/help',         labelKey: 'nav_support',      fallback: 'Help & Support' },
]

const DASHBOARD_PATH = {
  customer: '/customer',
  worker:   '/worker',
  cooperative_admin: '/cooperative',
  admin:    '/admin',
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { lang, setLanguage, t } = useLanguage()
  const navigate         = useNavigate()

  // `false` = mobile menu closed. Clicking the hamburger flips it.
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  const linkClasses = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-brand-700' : 'text-muted hover:text-ink'
    }`

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/')
    } finally {
      setLoggingOut(false)
      closeMenu()
    }
  }

  const dashboardPath = user ? (DASHBOARD_PATH[user.role] || '/') : '/login'

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" onClick={closeMenu} aria-label="NEED home">
          <Logo />
        </Link>

        {/* Desktop links — hidden below the md breakpoint */}
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClasses}>
              {t(link.labelKey, link.fallback)}
            </NavLink>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink">
            <Globe size={14} className="text-muted" />
            <select
              value={lang}
              onChange={e => setLanguage(e.target.value)}
              className="bg-transparent font-medium text-ink focus:outline-none cursor-pointer"
              aria-label="Select Language"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-brand-700"
              >
                <User size={16} />
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn btn-ghost flex items-center gap-1.5"
              >
                <LogOut size={16} />
                {loggingOut ? 'Logging out…' : t('nav_logout', 'Log out')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost">{t('nav_login', 'Log in')}</Link>
              <Link to="/register" className="btn btn-primary">{t('nav_register', 'Join Cooperative')}</Link>
            </>
          )}
        </div>

        {/* Hamburger — only visible on small screens */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-line text-ink md:hidden"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      {isMenuOpen && (
        <div className="border-t border-line bg-paper md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {user ? (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  to={dashboardPath}
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-brand-50"
                >
                  <User size={16} /> {user.name} — Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="btn btn-outline w-full"
                >
                  {loggingOut ? 'Logging out…' : 'Log out'}
                </button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login"    onClick={closeMenu} className="btn btn-outline w-full">Log in</Link>
                <Link to="/register" onClick={closeMenu} className="btn btn-primary w-full">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
