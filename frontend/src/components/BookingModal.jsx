/**
 * BookingModal.jsx — Stitch 4-Step Interactive Cooperative Dispatch Modal.
 */

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  IndianRupee,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { createBooking } from '../services/api'
import { getServiceIcon } from './serviceIcons'
import { getServiceImage } from '../utils/serviceImages'

const TIME_SLOTS = [
  'Morning (9 AM - 12 PM)',
  'Afternoon (12 PM - 3 PM)',
  'Evening (4 PM - 7 PM)',
  'Late Evening (7 PM - 9 PM)',
]

function localDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function BookingModal({
  isOpen,
  onClose,
  service = null,
  worker = null,
  allServices = [],
  onSuccess,
}) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const defaultDate = localDate(1)

  const [selectedServiceId, setSelectedServiceId] = useState(service?.id || '')
  const [scheduledDate, setScheduledDate]         = useState(defaultDate)
  const [scheduledTime, setScheduledTime]         = useState(TIME_SLOTS[0])
  const [address, setAddress]                     = useState(user?.address || '')
  const [description, setDescription]             = useState('')
  const [isEmergency, setIsEmergency]             = useState(false)
  const [includeProtection, setIncludeProtection] = useState(false)
  const [showProtectionTooltip, setShowProtectionTooltip] = useState(false)

  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const successTimer = useRef(null)

  useEffect(() => {
    if (service) {
      setSelectedServiceId(service.id)
    } else if (allServices.length > 0 && !selectedServiceId) {
      setSelectedServiceId(allServices[0].id)
    }
  }, [service, allServices])

  useEffect(() => {
    if (user?.address && !address) {
      setAddress(user.address)
    }
  }, [user])

  useEffect(() => {
    if (isOpen) {
      setError('')
      setSuccess(false)
      setIncludeProtection(false)
      setShowProtectionTooltip(false)
      if (!address && user?.address) setAddress(user.address)
    }
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current)
    }
  }, [isOpen])

  if (!isOpen) return null

  const activeService =
    service ||
    allServices.find((s) => String(s.id) === String(selectedServiceId)) ||
    allServices[0] ||
    null

  const basePrice = Number(activeService?.starting_price || activeService?.base_price || 299)
  const emergencySurcharge = isEmergency ? 100 : 0
  const baseServiceTotal = basePrice + emergencySurcharge
  const convenienceFee = 20
  const rawProtectionFee = Math.round(baseServiceTotal * 0.05)
  const protectionFee = includeProtection ? Math.min(Math.max(rawProtectionFee, 10), 50) : 0
  const finalPayableTotal = baseServiceTotal + convenienceFee + protectionFee

  const workerShare = Math.round(baseServiceTotal * 0.85)
  const welfareShare = Math.round(baseServiceTotal * 0.10)
  const coopOpsShare = baseServiceTotal - workerShare - welfareShare

  async function handleSubmit(e) {
    e.preventDefault()

    if (!user) {
      onClose()
      navigate('/login', { state: { from: { pathname: '/services' } } })
      return
    }

    if (!address.trim()) {
      setError('Please provide your service address in Noida/NCR.')
      return
    }

    if (!scheduledDate) {
      setError('Please choose a preferred service date.')
      return
    }

    setBusy(true)
    setError('')

    try {
      const payload = {
        service_id: activeService?.id || selectedServiceId,
        worker_id: worker?.id || null,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        address: address.trim(),
        notes: description.trim(),
        is_emergency: isEmergency,
        include_protection: includeProtection,
        has_protection: includeProtection,
      }

      const res = await createBooking(payload)
      setSuccess(true)

      successTimer.current = setTimeout(() => {
        onClose()
        if (onSuccess) onSuccess(res.booking || res)
        navigate('/customer')
      }, 1600)
    } catch (err) {
      const msg = err?.response?.data?.error || 'Unable to schedule dispatch. Please try again.'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const Icon = activeService ? getServiceIcon(activeService.icon) : Wrench

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm"
        onClick={busy ? undefined : onClose}
      />

      <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/60 z-10 my-8 animate-fade-in">
        {/* Tactile Cooperative Header */}
        <div className="bg-inverse-surface text-inverse-on-surface px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container text-[18px]">badge</span>
            <span className="font-label-caps text-[11px] tracking-wider text-secondary-fixed uppercase font-bold">
              Cooperative Dispatch System
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/20 text-primary-fixed text-[10px] font-mono font-bold px-2 py-0.5 rounded">
              ACT 2002 COMPLIANT
            </span>
            <button
              onClick={onClose}
              disabled={busy}
              className="text-inverse-on-surface/70 hover:text-inverse-on-surface p-1 rounded-lg hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Title Bar */}
        <div className="p-5 border-b border-outline-variant/40 bg-surface-container-low flex items-center justify-between">
          <div>
            <span className="font-label-caps text-[10px] uppercase text-primary font-bold">
              Instant Guild Dispatch
            </span>
            <h2 className="font-headline-md text-lg sm:text-xl text-on-surface font-extrabold">
              Book Verified Member
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase">Fixed Rate</span>
            <div className="font-metric-val text-xl text-primary font-extrabold leading-tight">
              ₹{finalPayableTotal}
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary mx-auto flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-headline-md text-xl text-on-surface font-bold">
              Booking Confirmed!
            </h3>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              Your service request has been assigned to the local trade guild. Redirecting to your customer activity dashboard…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={16} className="text-error shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Selected Service */}
            <div className="space-y-1.5">
              <label className="font-label-md text-xs text-on-surface font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">1</span>
                  Service Task &amp; Scope
                </span>
                <span className="text-[11px] text-primary font-semibold">Standard Scope</span>
              </label>

              {allServices.length > 0 && !service ? (
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low p-2.5 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {allServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (from ₹{s.starting_price}) — {s.category}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getServiceImage(activeService)}
                      alt={activeService?.name || 'Service'}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-outline-variant/50 shadow-xs"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
                      }}
                    />
                    <div className="min-w-0">
                      <div className="font-label-md text-sm text-on-surface font-bold truncate">
                        {activeService?.name || 'Selected Service'}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        Up to 60 mins • Diagnostics &amp; Tools Included
                      </div>
                    </div>
                  </div>
                  <span className="font-metric-val text-base text-primary font-bold">
                    ₹{basePrice}
                  </span>
                </div>
              )}
            </div>

            {/* Step 2: Date & Slot */}
            <div className="space-y-1.5">
              <label className="font-label-md text-xs text-on-surface font-bold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">2</span>
                Choose Date &amp; Time Slot
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Preferred Date</span>
                  <input
                    type="date"
                    min={localDate(0)}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Slot Window</span>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Assigned Guild Worker */}
            <div className="space-y-1.5">
              <label className="font-label-md text-xs text-on-surface font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">3</span>
                  Assigned Guild Worker
                </span>
                <span className="font-label-caps text-[10px] text-secondary font-bold uppercase">
                  Democratic Rotation
                </span>
              </label>

              {worker ? (
                <div className="bg-surface-container-low rounded-xl p-3 border-l-4 border-primary flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {worker.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-on-surface truncate">{worker.name}</span>
                      <span className="text-secondary font-bold text-xs">★ {worker.rating}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {worker.trade} • {worker.area || 'Noida Sector 62'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container-low rounded-xl p-3 border border-dashed border-outline-variant flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-on-surface block">
                      Auto-Assigned Nearest Verified Member
                    </span>
                    <span className="text-[11px] text-on-surface-variant block">
                      Guaranteed arrival by certified artisan from the local Sector guild.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Address & Details */}
            <div className="space-y-1.5">
              <label className="font-label-md text-xs text-on-surface font-bold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">4</span>
                Service Address &amp; Issue Notes
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Apartment, building, sector, street (e.g. B-402, Sector 62, Noida)"
                required
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes for artisan (e.g. switch sparking, high ceiling, bring 16A socket)..."
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Rush Dispatch Option */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary-fixed/30 border border-secondary-container/40 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="rounded border-outline text-primary focus:ring-primary w-4 h-4"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">Emergency Rush Dispatch (Under 45 mins)</span>
                  <span className="font-mono text-xs font-bold text-secondary">+₹100</span>
                </div>
                <span className="text-[10px] text-on-surface-variant block">
                  Priority alert broadcast directly to all on-duty artisans.
                </span>
              </div>
            </label>

            {/* Platform Fees & Optional Customer Protection Plan */}
            <div className="space-y-2 pt-1">
              {/* Compulsory Convenience Fee Notice */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-on-surface block">
                      Platform Convenience Fee (Compulsory)
                    </span>
                    <span className="text-[10px] text-on-surface-variant block">
                      Covers digital cooperative dispatch, escrow verification &amp; 24/7 ops
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-primary shrink-0">
                  ₹{convenienceFee}
                </span>
              </div>

              {/* Optional Customer Protection Plan */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-primary-fixed/20 border border-primary/30 cursor-pointer transition hover:bg-primary-fixed/30">
                <input
                  type="checkbox"
                  checked={includeProtection}
                  onChange={(e) => setIncludeProtection(e.target.checked)}
                  className="rounded border-outline text-primary focus:ring-primary w-4 h-4 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-primary shrink-0" />
                      <span className="font-bold text-xs text-on-surface">
                        Add Customer Protection Plan
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowProtectionTooltip(!showProtectionTooltip)
                        }}
                        className="text-on-surface-variant hover:text-primary transition p-0.5"
                        title="Learn more about Customer Protection Plan"
                      >
                        <HelpCircle size={13} />
                      </button>
                    </div>
                    <span className="font-mono text-xs font-bold text-primary">
                      +₹{Math.min(Math.max(rawProtectionFee, 10), 50)}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5">
                    Covers accidental property damage, workmanship guarantee &amp; prioritized guild re-service (max ₹50).
                  </span>
                  {showProtectionTooltip && (
                    <div className="mt-2 p-2.5 rounded-lg bg-surface-container-highest text-[11px] text-on-surface-variant border border-outline-variant/60 animate-fade-in space-y-1">
                      <div className="font-bold text-primary flex items-center gap-1">
                        <ShieldCheck size={13} />
                        NEED Peace-of-Mind Warranty:
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                        <li>Up to ₹5,000 accidental damage repair coverage on qualifying jobs.</li>
                        <li>7-day post-service free callback inspection if unsatisfied.</li>
                        <li>Direct priority dispute arbitration by Noida Cooperative Federation.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Live Transparent Bill Summary */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/50 space-y-2">
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-outline-variant/40">
                <span className="font-label-caps text-[10px] uppercase font-bold text-on-surface-variant">
                  Itemized Fare Breakdown
                </span>
                <span className="font-bold text-primary text-xs">
                  ₹{finalPayableTotal} Total
                </span>
              </div>
              <div className="space-y-1 text-xs text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Base Service Fare:</span>
                  <span className="font-mono text-on-surface font-medium">₹{basePrice}</span>
                </div>
                {isEmergency && (
                  <div className="flex justify-between text-secondary font-medium">
                    <span>Emergency Rush Surcharge:</span>
                    <span className="font-mono">+₹100</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Platform Convenience Fee:</span>
                  <span className="font-mono text-on-surface font-medium">+₹{convenienceFee}</span>
                </div>
                {includeProtection && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>Customer Protection Fee:</span>
                    <span className="font-mono">+₹{protectionFee}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-outline-variant/40 font-bold text-on-surface text-xs">
                  <span>Total Payable:</span>
                  <span className="font-mono font-black text-primary text-sm">₹{finalPayableTotal}</span>
                </div>
              </div>

              {/* Cooperative Democratic Split meter */}
              <div className="pt-2 border-t border-outline-variant/30 space-y-1">
                <div className="flex justify-between text-[10px] text-on-surface-variant">
                  <span className="font-bold text-primary">Artisan Share: ₹{workerShare} (85%)</span>
                  <span className="font-bold text-secondary">Welfare: ₹{welfareShare} (10%)</span>
                  <span>Guild Ops: ₹{coopOpsShare} (5%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-surface-container flex">
                  <div className="h-full bg-primary" style={{ width: '85%' }} />
                  <div className="h-full bg-secondary-container" style={{ width: '10%' }} />
                  <div className="h-full bg-outline-variant" style={{ width: '5%' }} />
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition shadow-md flex items-center justify-center gap-2 font-label-md text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Dispatching Request…</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Confirm Cooperative Booking (₹{finalPayableTotal})</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
