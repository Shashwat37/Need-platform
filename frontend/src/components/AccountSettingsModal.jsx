/**
 * AccountSettingsModal.jsx — Interactive User Profile & Account Settings Modal.
 *
 * Allows users (Residents, Artisans, Admins) to view and update their profile
 * information (name, phone, address, communication preferences, and language)
 * directly from the navbar profile menu.
 */

import { useState } from 'react'
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Globe,
  Home,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function AccountSettingsModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth()
  const { lang, setLanguage } = useLanguage()

  const [name, setName] = useState(user?.name || 'Ananya Mehta')
  const [email] = useState(user?.email || 'ananya@coop.in')
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210')
  const [address, setAddress] = useState(user?.address || 'Flat 402, B-Block, Sector 62, Noida, UP')
  const [whatsappAlerts, setWhatsappAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  if (!isOpen) return null

  function handleSave(e) {
    e.preventDefault()
    if (updateUser) {
      updateUser({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      })
    }
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 1200)
  }

  const roleLabel =
    user?.role === 'worker'
      ? 'Verified Artisan Member'
      : user?.role === 'cooperative_admin'
      ? 'Society / Cooperative Admin'
      : user?.role === 'admin'
      ? 'Federation Apex Officer'
      : 'Democratic Resident Member'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/60 z-10 my-8 animate-fade-in">
        {/* Header Strip */}
        <div className="bg-primary text-on-primary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
              <User size={20} />
            </div>
            <div>
              <h2 className="font-headline-sm text-base font-extrabold text-white">
                Account Settings
              </h2>
              <span className="text-[11px] text-white/80 font-medium flex items-center gap-1">
                <ShieldCheck size={13} className="text-secondary-fixed" />
                {roleLabel}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 flex items-center gap-2.5 text-xs font-bold animate-fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>Settings saved successfully! Your profile is updated.</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <User size={14} className="text-primary" />
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Mail size={14} className="text-primary" />
                Registered Email
              </label>
              <span className="text-[10px] text-secondary font-bold uppercase bg-secondary-fixed/40 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low text-sm text-on-surface-variant cursor-not-allowed font-medium"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Phone size={14} className="text-primary" />
              Mobile Phone (For dispatch SMS &amp; OTP)
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
          </div>

          {/* Residence / Service Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Home size={14} className="text-primary" />
              Service Address / Resident Flat
            </label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Flat number, Society name, Sector, City"
              className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-medium resize-none"
            />
          </div>

          {/* Language & Notifications Preference */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                <Globe size={15} className="text-secondary" />
                <span>Preferred Language</span>
              </div>
              <select
                value={lang}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-outline-variant bg-white font-semibold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="en">English (India)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="bn">বাংলা (Bengali)</option>
              </select>
            </div>

            <div className="border-t border-outline-variant/40 pt-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface font-medium flex items-center gap-1.5">
                  <Bell size={13} className="text-primary" />
                  Live Worker Tracking WhatsApp Alerts
                </span>
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer accent-primary"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface font-medium flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-primary" />
                  Statutory Tax Invoice via SMS
                </span>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs font-bold px-5 py-2.5 shadow-sm flex items-center gap-2"
            >
              <Save size={15} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
