/**
 * BookingModal.jsx — interactive booking modal for customers.
 *
 * WHAT: Allows logged-in customers to schedule a service with a chosen worker,
 *       select date/time, provide service address & description, and choose
 *       an optional emergency / rush dispatch.
 *
 * WHY:  On ShramSetu, booking is simple, transparent, and direct. Pricing is
 *       calculated upfront with zero hidden platform surge fees.
 *
 * HOW:  Calls createBooking() from api.js and notifies parent on success.
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

const TIME_SLOTS = [
  'Morning (9 AM - 12 PM)',
  'Afternoon (12 PM - 3 PM)',
  'Evening (3 PM - 6 PM)',
  'Late Evening (6 PM - 9 PM)',
]

// Today's date as YYYY-MM-DD, in the user's own timezone.
//
// WHY not toISOString(): that converts to UTC first. India is UTC+5:30, so
// between midnight and 5:30am "tomorrow" came back as today's date, and the
// `min` on the date input came back as yesterday — meaning a late-night user
// was offered a same-day slot on a field labelled "Preferred Date".
function localDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const pad = n => String(n).padStart(2, '0')
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

  const defaultDate = localDate(1)   // tomorrow, in the user's timezone

  const [selectedServiceId, setSelectedServiceId] = useState(service?.id || '')
  const [scheduledDate, setScheduledDate]         = useState(defaultDate)
  const [scheduledTime, setScheduledTime]         = useState(TIME_SLOTS[0])
  const [address, setAddress]                     = useState(user?.address || '')
  const [description, setDescription]             = useState('')
  const [isEmergency, setIsEmergency]             = useState(false)

  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)

  // Holds the "Booking Confirmed!" timer so closing early can cancel it.
  const successTimer = useRef(null)

  // Update selected service if prop changes
  useEffect(() => {
    if (service) {
      setSelectedServiceId(service.id)
    } else if (allServices.length > 0 && !selectedServiceId) {
      setSelectedServiceId(allServices[0].id)
    }
  }, [service, allServices])

  // Update address when user data loads
  useEffect(() => {
    if (user?.address && !address) {
      setAddress(user.address)
    }
  }, [user])

  // Start every new booking from a clean form.
  //
  // WHY: closing this modal only hides it (the `return null` below), it does not
  // unmount it, so React keeps the state above. Without this reset, opening the
  // form a second time still held the previous request's description AND left
  // "Mark as Urgent" ticked — so the next booking quietly carried a ₹100
  // emergency fee the customer never asked for, all the way to the invoice.
  //
  // The cleanup cancels the success timer if the modal closes first. Without it,
  // dismissing the "Booking Confirmed!" splash early still let the timer fire
  // 1.6 seconds later — which on the services page ran navigate('/customer') and
  // yanked the user off the page they had gone back to browsing.
  useEffect(() => {
    if (isOpen) {
      setDescription('')
      setIsEmergency(false)
      setError('')
      setSuccess(false)
      setBusy(false)
      setScheduledDate(localDate(1))
    }
    return () => {
      if (successTimer.current) {
        clearTimeout(successTimer.current)
        successTimer.current = null
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  // Resolve current active service object
  const currentService = service || allServices.find(s => s.id === Number(selectedServiceId)) || allServices[0]
  const basePrice = currentService?.starting_price || 299
  const rushFee   = isEmergency ? 100 : 0
  const totalPrice = basePrice + rushFee

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!user) {
      // Prompt login if visitor clicks book
      navigate('/login')
      return
    }

    if (!scheduledDate) {
      setError('Please select a service date.')
      return
    }

    if (!address.trim()) {
      setError('Please provide your service delivery address.')
      return
    }

    setBusy(true)
    try {
      const payload = {
        service_id:     currentService?.id || Number(selectedServiceId),
        worker_id:      worker?.worker_id || worker?.user_id || null,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        address:        address.trim(),
        description:    description.trim(),
        is_emergency:   isEmergency,
      }

      const res = await createBooking(payload)
      setSuccess(true)
      successTimer.current = setTimeout(() => {
        successTimer.current = null
        setSuccess(false)
        onClose()
        if (onSuccess) {
          onSuccess(res)
        } else {
          navigate('/customer')
        }
      }, 1600)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit booking. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const ServiceIcon = currentService ? getServiceIcon(currentService.icon) : Wrench

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div className="card relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border-brand-100">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1 text-muted hover:bg-paper hover:text-ink transition"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Success Splash */}
        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-verified/10 text-verified animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-display text-2xl font-bold text-ink">Booking Confirmed!</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Your service request has been registered. You can track updates in your customer dashboard.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
                <Sparkles size={15} />
                Cooperative Service Request
              </div>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
                Book {currentService?.name || 'Service'}
              </h2>
              <p className="text-xs text-muted">
                Transparent rates • Verified cooperative workers • Pay after service
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Worker Preview / Auto-assign Banner */}
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-line bg-paper/70 p-3.5">
              {worker ? (
                <>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 font-display font-bold text-brand-700">
                    {worker.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      {worker.name}
                      <span className="rounded-full bg-verified/10 text-verified border border-verified/30 px-1.5 py-0.5 text-[10px] font-bold">
                        Verified
                      </span>
                    </p>
                    <p className="text-[11px] text-muted">
                      {worker.trade} • {worker.rating}★ ({worker.total_jobs} jobs done) • {worker.area}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <ServiceIcon size={20} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-ink">Auto-match Best Verified Provider</p>
                    <p className="text-[11px] text-muted">
                      We will assign the nearest top-rated cooperative member in your area.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Service Select (if not preselected) */}
              {!service && allServices.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">Select Service</label>
                  <select
                    value={selectedServiceId}
                    onChange={e => setSelectedServiceId(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {allServices.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category}) — from ₹{s.starting_price}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date & Time Row */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink flex items-center gap-1.5">
                    <Calendar size={13} className="text-muted" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    min={localDate()}
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-ink flex items-center gap-1.5">
                    <Clock size={13} className="text-muted" />
                    Preferred Time Slot
                  </label>
                  <select
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="mb-1 block text-xs font-medium text-ink flex items-center gap-1.5">
                  <MapPin size={13} className="text-muted" />
                  Service Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="House/Flat No., Street, Landmark, City..."
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-medium text-ink">
                  Job Description / Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Switchboard sparking, need fan capacitor replacement..."
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Emergency / Rush Dispatch Toggle */}
              <div className="rounded-xl border border-line bg-paper/60 p-3.5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={e => setIsEmergency(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-ink">Mark as Urgent / Emergency Request</span>
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 uppercase">
                        +₹100
                      </span>
                    </div>
                    <p className="text-[11px] text-muted">
                      Priority dispatch within 60 minutes for burst pipes, electrical short circuits, and critical repairs.
                    </p>
                  </div>
                </label>
              </div>

              {/* Transparent Price Summary Card */}
              <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 space-y-2">
                <div className="flex justify-between text-xs text-muted">
                  <span>Base Service Fare</span>
                  <span className="font-mono text-ink">₹{basePrice}</span>
                </div>

                {isEmergency && (
                  <div className="flex justify-between text-xs text-red-700">
                    <span>Urgent Rush Dispatch Fee</span>
                    <span className="font-mono">+₹100</span>
                  </div>
                )}

                <div className="border-t border-brand-100 pt-2 flex justify-between text-sm font-bold text-ink">
                  <span>Total Estimated Amount</span>
                  <span className="font-mono text-brand-700 text-base">₹{totalPrice}</span>
                </div>

                <p className="text-[11px] text-muted text-center pt-1">
                  🔒 Pay after service completion. 10% is saved into the worker's cooperative welfare fund.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-primary flex items-center gap-2 text-xs py-2.5 px-5 disabled:opacity-60"
                >
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                  <span>{busy ? 'Booking…' : `Confirm Booking (₹${totalPrice})`}</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  )
}
