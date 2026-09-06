/**
 * Navbar.jsx — NEED Cooperative Federation Master Navigation Bar.
 *
 * Provides responsive, un-truncated layout across all screen resolutions,
 * interactive Portals dropdown, and a dedicated Profile Menu Dropdown
 * containing Dashboard, Account Settings Modal, Bookings, and Log Out.
 */

import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  BrainCircuit,
  Building2,
  ChevronDown,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Receipt,
  Settings,
  ShieldCheck,
  Sun,
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'
import AccountSettingsModal from './AccountSettingsModal'

const CORE_NAV_LINKS = [
  { to: '/services',      labelKey: 'nav_services',      fallback: 'Find Services',      shortFallback: 'Services' },
  { to: '/forecast',      labelKey: 'nav_forecast',      fallback: 'AI Forecast 🤖',    shortFallback: 'AI Forecast' },
  { to: '/subscriptions', labelKey: 'nav_subscriptions', fallback: 'Organization Plans', shortFallback: 'Plans' },
]

const SECONDARY_NAV_LINKS = [
  { to: '/cooperatives',  labelKey: 'nav_cooperatives',  fallback: 'Labour Cooperatives' },
  { to: '/about',         labelKey: 'nav_about',         fallback: 'Cooperative Model' },
  { to: '/support',       labelKey: 'nav_support',       fallback: 'Help & Support' },
]

const PRIMARY_LINKS = [...CORE_NAV_LINKS, ...SECONDARY_NAV_LINKS]

const PORTALS = [
  {
    to: '/forecast',
    icon: BrainCircuit,
    title: 'AI Demand Forecast',
    desc: 'Real-time ML demand prediction & weather impact',
  },
  {
    to: '/worker',
    icon: Wrench,
    title: 'Worker Portal',
    desc: 'Artisan dispatch, wallet & fair wage payouts',
  },
  {
    to: '/cooperative',
    icon: Building2,
    title: 'Society Hub',
    desc: 'RWA societies & verified residential governance',
  },
  {
    to: '/admin',
    icon: ShieldCheck,
    title: 'Federation Admin',
    desc: 'Apex monitoring, revenue audit & cooperatives',
  },
]

const DASHBOARD_PATH = {
  customer: '/customer',
  worker: '/worker',
  cooperative_admin: '/cooperative',
  admin: '/admin',
}

const ROLE_LABELS = {
  customer: 'Resident Member',
  worker: 'Verified Artisan',
  cooperative_admin: 'Society Admin',
  admin: 'Federation Officer',
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
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isPortalsOpen, setIsPortalsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const profileRef = useRef(null)
  const portalsRef = useRef(null)

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (portalsRef.current && !portalsRef.current.contains(event.target)) {
        setIsPortalsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
        setIsPortalsOpen(false)
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const closeAll = () => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
    setIsPortalsOpen(false)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      closeAll()
      navigate('/')
    } finally {
      setLoggingOut(false)
    }
  }

  const dashboardPath = user ? DASHBOARD_PATH[user.role] || '/customer' : '/login'
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  const linkClasses = ({ isActive }) =>
    `px-2.5 xl:px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-all rounded-lg shrink-0 ${
      isActive
        ? 'bg-primary-container text-on-primary-container font-bold shadow-xs'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 container-page flex items-center justify-between gap-2 lg:gap-3">
          
          {/* ── Left: Brand + India Co-op Seal ────────────────────────────── */}
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <Link to="/" onClick={closeAll} aria-label="NEED Federation Home" className="flex items-center">
              <Logo />
            </Link>
            
            <div className="hidden 3xl:flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-full border border-outline-variant/40">
              <span className="material-symbols-outlined text-primary text-[15px]">verified</span>
              <span className="text-[11px] text-on-surface font-semibold whitespace-nowrap">India Cooperative Act • Verified</span>
            </div>
          </div>

          {/* ── Center Desktop Navigation Links with Responsive Priority Collapse ── */}
          <nav className="hidden lg:flex items-center gap-1 min-w-0 flex-shrink">
            {/* Core Priority Links (Always visible on desktop >= 1024px) */}
            {CORE_NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClasses}>
                <span className="hidden xl:inline">{t(link.labelKey, link.fallback)}</span>
                <span className="xl:hidden">{link.shortFallback || t(link.labelKey, link.fallback)}</span>
              </NavLink>
            ))}

            {/* Secondary Links (Visible directly on wide screens >= 1920px) */}
            {SECONDARY_NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={`${linkClasses} hidden 3xl:inline-flex`}>
                {t(link.labelKey, link.fallback)}
              </NavLink>
            ))}

            {/* Hubs & More Dropdown */}
            <div className="relative shrink-0" ref={portalsRef}>
              <button
                type="button"
                onClick={() => setIsPortalsOpen((prev) => !prev)}
                className={`px-2.5 xl:px-3 py-1.5 text-[13px] font-semibold rounded-lg flex items-center gap-1 transition-all whitespace-nowrap ${
                  isPortalsOpen
                    ? 'bg-surface-container-high text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
                aria-expanded={isPortalsOpen}
              >
                <span className="whitespace-nowrap hidden 3xl:inline">Co-op Hubs</span>
                <span className="whitespace-nowrap hidden xl:inline 3xl:hidden">Co-op Hubs &amp; More</span>
                <span className="whitespace-nowrap xl:hidden">Hubs</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 shrink-0 ${isPortalsOpen ? 'rotate-180 text-primary' : ''}`}
                />
              </button>

              {isPortalsOpen && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/60 p-2 z-50 animate-fade-in max-h-[80vh] overflow-y-auto">
                  {/* Secondary Links when on compact desktop (< 1920px) */}
                  <div className="3xl:hidden pb-2 mb-2 border-b border-outline-variant/40">
                    <div className="px-3 py-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Cooperative Network
                    </div>
                    <div className="space-y-0.5">
                      {SECONDARY_NAV_LINKS.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsPortalsOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container-low transition"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{t(link.labelKey, link.fallback)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Federation Portals
                  </div>
                  <div className="space-y-1">
                    {PORTALS.map((portal) => {
                      const Icon = portal.icon
                      return (
                        <Link
                          key={portal.to}
                          to={portal.to}
                          onClick={() => setIsPortalsOpen(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-on-primary transition">
                            <Icon size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-on-surface group-hover:text-primary transition">
                              {portal.title}
                            </div>
                            <div className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                              {portal.desc}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* ── Right Desktop Utilities ──────────────────────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* Civic Hub Location (Visible on 3xl) */}
            <div className="hidden 3xl:flex items-center gap-1 bg-surface-container-lowest px-2.5 py-1 rounded-full border border-outline-variant/50 shadow-xs text-xs text-on-surface font-semibold">
              <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span>
              <span>Noida &amp; NCR</span>
            </div>

            {/* Language Switcher (Visible on screens >= 1280px to protect compact desktop) */}
            <div className="hidden xl:flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-full border border-outline-variant/50 shadow-xs text-xs shrink-0">
              <Globe size={13} className="text-on-surface-variant ml-1" />
              <select
                value={lang}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-semibold text-on-surface focus:outline-none cursor-pointer text-xs pr-1"
                aria-label="Select Language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Theme Mode Toggle Button ────────────────────────── */}
            <button
              type="button"
              id="theme-mode-toggle-button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex items-center justify-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-full border border-outline-variant/60 bg-surface-container-lowest hover:border-primary/60 shadow-xs text-xs font-bold text-on-surface transition-all group cursor-pointer shrink-0"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={15} className="text-amber-400 animate-spin-slow shrink-0" />
                  <span className="hidden sm:inline text-[11px] font-bold text-amber-300">Light</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="text-primary group-hover:-rotate-12 transition-transform shrink-0" />
                  <span className="hidden sm:inline text-[11px] font-bold text-on-surface">Dark</span>
                </>
              )}
            </button>

            {/* ── User Authentication & Profile Dropdown ───────────────── */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  id="user-profile-menu-button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all ${
                    isProfileOpen
                      ? 'bg-surface-container-highest border-primary/50 ring-2 ring-primary/20'
                      : 'bg-surface-container-high/90 hover:bg-surface-container-highest border-outline-variant/60 shadow-xs'
                  }`}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  {/* User Avatar Circle */}
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs shadow-xs">
                      {userInitials}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                  </div>

                  {/* Name + Role Pill */}
                  <div className="flex items-center gap-1.5 text-left">
                    <span className="text-xs font-bold text-on-surface max-w-[90px] sm:max-w-[120px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="hidden md:inline-block bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-black">
                      {user.role === 'cooperative_admin' ? 'Coop' : user.role}
                    </span>
                  </div>

                  <ChevronDown
                    size={14}
                    className={`text-on-surface-variant transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                {/* ── Profile Dropdown Menu Card ────────────────────────── */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 overflow-hidden z-50 animate-fade-in">
                    {/* User Identity Header */}
                    <div className="p-4 bg-surface-container-low border-b border-outline-variant/50 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary text-on-primary font-black flex items-center justify-center text-base shadow-sm">
                        {userInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-sm text-on-surface truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-on-surface-variant truncate font-medium">
                          {user.email || 'Resident Citizen'}
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">
                            <ShieldCheck size={11} />
                            {ROLE_LABELS[user.role] || user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="p-2 space-y-1">
                      {/* Dashboard Link */}
                      <Link
                        to={dashboardPath}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low transition text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-on-primary transition">
                          <LayoutDashboard size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-on-surface group-hover:text-primary transition">
                            My Dashboard
                          </div>
                          <div className="text-[11px] text-on-surface-variant truncate">
                            Live tracking, bookings &amp; activity
                          </div>
                        </div>
                      </Link>

                      {/* Account Settings Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false)
                          setIsSettingsOpen(true)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low transition text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-secondary-fixed/40 text-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-secondary group-hover:text-on-secondary transition">
                          <Settings size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-on-surface group-hover:text-secondary transition">
                            Account Settings
                          </div>
                          <div className="text-[11px] text-on-surface-variant truncate">
                            Profile, phone, address &amp; alerts
                          </div>
                        </div>
                      </button>

                      {/* Bookings & Invoices */}
                      <Link
                        to="/customer"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low transition text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition">
                          <Receipt size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-on-surface group-hover:text-primary transition">
                            Bookings &amp; Invoices
                          </div>
                          <div className="text-[11px] text-on-surface-variant truncate">
                            Itemized receipts &amp; service logs
                          </div>
                        </div>
                      </Link>

                      {/* AI Demand Forecasting */}
                      <Link
                        to="/forecast"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low transition text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-on-primary transition">
                          <BrainCircuit size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-on-surface group-hover:text-primary transition flex items-center gap-1.5">
                            <span>AI Demand Forecast</span>
                            <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.2 rounded font-black uppercase">ML</span>
                          </div>
                          <div className="text-[11px] text-on-surface-variant truncate">
                            Live weather impact &amp; artisan surges
                          </div>
                        </div>
                      </Link>

                      {/* Organization Plans */}
                      <Link
                        to="/subscriptions"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low transition text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition">
                          <Building2 size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-on-surface group-hover:text-primary transition">
                            Organization Plans
                          </div>
                          <div className="text-[11px] text-on-surface-variant truncate">
                            Retainers &amp; Society verified plans
                          </div>
                        </div>
                      </Link>

                      {/* Theme Toggle in Profile Menu */}
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-container-low transition text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-on-primary transition">
                            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-primary" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-on-surface truncate">
                              {theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}
                            </div>
                            <div className="text-[11px] text-on-surface-variant truncate">
                              {theme === 'dark' ? 'Switch to daylight theme' : 'Switch to deep forest obsidian'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                          {theme === 'dark' ? 'DARK' : 'LIGHT'}
                        </span>
                      </button>
                    </div>

                    {/* Divider & Log Out */}
                    <div className="p-2 border-t border-outline-variant/50 bg-surface-container-lowest">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-error hover:bg-error-container/20 transition text-left font-bold text-xs group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center flex-shrink-0 group-hover:bg-error group-hover:text-white transition">
                          <LogOut size={16} />
                        </div>
                        <span>{loggingOut ? 'Signing out…' : 'Log Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Link
                  to="/login"
                  className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-on-surface hover:bg-surface-container transition-colors whitespace-nowrap"
                >
                  {t('nav_login', 'Log In')}
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex btn btn-primary text-xs font-bold px-2.5 sm:px-3.5 py-1.5 shadow-sm whitespace-nowrap"
                >
                  {t('nav_register', 'Join Co-op')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden shrink-0">
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="w-9 h-9 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-center text-on-surface hover:bg-surface-container transition cursor-pointer"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Drawer ────────────────────────────────────────────── */}
        {isMenuOpen && (
          <div className="border-t border-outline-variant/60 bg-surface px-4 py-4 lg:hidden shadow-lg animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 text-xs">
                <span className="flex items-center gap-1 font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span>
                  Noida &amp; NCR Service Zone
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs font-bold text-on-surface"
                    title="Toggle Theme"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun size={13} className="text-amber-400" />
                        <span>Light</span>
                      </>
                    ) : (
                      <>
                        <Moon size={13} className="text-primary" />
                        <span>Dark</span>
                      </>
                    )}
                  </button>
                  <select
                    value={lang}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded border border-outline-variant bg-surface-container-lowest text-on-surface px-2 py-1 text-xs"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {PRIMARY_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeAll}
                  className={({ isActive }) =>
                    `px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`
                  }
                >
                  {t(link.labelKey, link.fallback)}
                </NavLink>
              ))}

              <div className="pt-2 border-t border-outline-variant/40">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase px-2">
                  Federation Portals
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PORTALS.map((portal) => (
                    <Link
                      key={portal.to}
                      to={portal.to}
                      onClick={closeAll}
                      className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-bold text-on-surface flex items-center gap-2"
                    >
                      <portal.icon size={15} className="text-primary" />
                      <span>{portal.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/40 mt-1">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to={dashboardPath}
                      onClick={closeAll}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low text-on-surface font-bold text-sm border border-outline-variant/40"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
                          {userInitials}
                        </div>
                        <span>{user.name}</span>
                      </div>
                      <span className="text-primary font-bold text-xs">Dashboard →</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        closeAll()
                        setIsSettingsOpen(true)
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-outline-variant bg-surface-container text-xs font-bold text-on-surface"
                    >
                      <Settings size={15} />
                      <span>Account Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full btn btn-outline text-error font-bold text-sm"
                    >
                      {loggingOut ? 'Logging out…' : 'Log Out'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={closeAll}
                      className="btn btn-outline text-center text-sm font-semibold"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeAll}
                      className="btn btn-primary text-center text-sm font-semibold"
                    >
                      Join Co-op
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}
