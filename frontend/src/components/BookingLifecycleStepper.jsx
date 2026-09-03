/**
 * BookingLifecycleStepper.jsx — Structured Booking Status Tracker.
 *
 * Visual progress bar displaying the 8 lifecycle stages:
 *  Requested -> Accepted -> Worker Assigned -> On the Way -> Arrived -> In Progress -> Completed -> Customer Confirmed.
 */

import { CheckCircle2, Clock, MapPin, Play, UserCheck, Wrench, ShieldCheck, AlertCircle } from 'lucide-react'

const STAGES = [
  { key: 'requested', label: 'Requested', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { key: 'worker_assigned', label: 'Worker Assigned', icon: UserCheck },
  { key: 'on_the_way', label: 'On the Way', icon: MapPin },
  { key: 'arrived', label: 'Arrived', icon: ShieldCheck },
  { key: 'in_progress', label: 'In Progress', icon: Play },
  { key: 'completed', label: 'Completed', icon: Wrench },
  { key: 'confirmed', label: 'Customer Confirmed', icon: CheckCircle2 },
]

export default function BookingLifecycleStepper({ status, currentStageIndex = 0 }) {
  if (status === 'cancelled' || status === 'rejected') {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Booking {status === 'cancelled' ? 'Cancelled' : 'Declined'}</h4>
          <p className="text-xs text-rose-600">This service request is no longer active.</p>
        </div>
      </div>
    )
  }

  // Determine current index based on status key
  const statusMap = {
    pending: 0,
    requested: 0,
    accepted: 1,
    worker_assigned: 2,
    on_the_way: 3,
    arrived: 4,
    in_progress: 5,
    completed: 6,
    confirmed: 7,
  }

  const activeIdx = statusMap[status] ?? currentStageIndex

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between relative overflow-x-auto pb-2 scrollbar-none">
        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIdx
          const isCurrent = idx === activeIdx
          const Icon = stage.icon

          return (
            <div key={stage.key} className="flex flex-col items-center text-center min-w-[75px] sm:min-w-[90px] relative z-10 px-1">
              <div
                className={`grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full text-xs font-bold transition-all duration-200 shadow-sm ${
                  isDone
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-600/30'
                    : isCurrent
                    ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 scale-110'
                    : 'bg-stone-100 text-stone-400 border border-stone-200'
                }`}
              >
                {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
              </div>
              <span
                className={`mt-1.5 text-[10px] sm:text-xs font-semibold leading-tight ${
                  isCurrent
                    ? 'text-brand-700 font-bold'
                    : isDone
                    ? 'text-emerald-800'
                    : 'text-stone-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
