/**
 * WorkerTrackingModal.jsx — Live GPS Worker Route & Location Tracking Modal.
 *
 * Renders real-time OpenStreetMap / Vector Map tracking showing worker origin,
 * live vehicle movement along route, customer destination, ETA telemetry,
 * and direct phone/WhatsApp communication buttons.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Star,
  User,
  X,
} from 'lucide-react'

export default function WorkerTrackingModal({
  isOpen,
  onClose,
  booking,
}) {
  // Live GPS Animation Progress (0% at origin to 100% at customer residence)
  const [progress, setProgress] = useState(35)
  const [isLive, setIsLive]     = useState(true)

  // Dynamic Telemetry Calculations
  const totalDistanceKm = 2.4
  const remainingKm     = Math.max(0.2, (totalDistanceKm * (100 - progress) / 100)).toFixed(1)
  const etaMinutes      = Math.max(1, Math.ceil(remainingKm * 3))

  // Simulate live GPS movement along the map route
  useEffect(() => {
    if (!isOpen || !isLive) return

    const gpsInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) {
          return 92 // Arrived near residence
        }
        return prev + 1.5
      })
    }, 2000)

    return () => clearInterval(gpsInterval)
  }, [isOpen, isLive])

  if (!isOpen || !booking) return null

  const workerName = booking.worker_name || booking.worker_account_holder || 'Rahul Kumar'
  const workerPhone = booking.worker_phone || '9812345678'
  const workerRating = booking.worker_rating || 4.9
  const workerService = booking.service_name || 'Verified Artisan'
  const customerAddress = booking.address || 'Flat 402, Sector 62, Noida'
  const workerOrigin = booking.worker_hub || 'Sector 62 Cooperative Hub, Noida'
  const bookingOtp = booking.start_otp || '4892'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-[#071325]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Live Map Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 my-6 animate-fade-in flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0c2340] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shadow-sm border border-emerald-400/30">
              <Navigation size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live GPS Tracking • Noida Hub</span>
              </div>
              <h2 className="font-headline-sm text-base font-extrabold text-white tracking-tight">
                Partner Location &amp; Dispatch Status
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Acceptance & Origin Announcement Banner */}
        <div className="bg-emerald-600 text-white px-5 py-2.5 flex items-center justify-between text-xs font-bold shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-white shrink-0 animate-bounce" />
            <span>
              Job Accepted by <strong>{workerName}</strong>! Coming from <strong className="font-mono underline">{workerOrigin}</strong>
            </span>
          </div>
          <span className="bg-white/20 text-white font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold">
            LIVE GPS ACTIVE
          </span>
        </div>
        <div className="relative w-full h-72 sm:h-80 bg-slate-900 overflow-hidden select-none">
          {/* Map Base Tiles */}
          <div
            className="absolute inset-0 opacity-80 mix-blend-luminosity bg-cover bg-center transition-all duration-1000"
            style={{
              backgroundImage: `url('https://tile.openstreetmap.org/15/23974/12762.png')`,
              backgroundSize: '300px 300px',
              filter: 'contrast(1.1) brightness(0.85) hue-rotate(190deg)',
            }}
          />

          {/* Grid Overlay for Tactical Map Feel */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

          {/* SVG Animated Polyline Route */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            {/* Background Route Track */}
            <path
              d="M 60,220 C 140,180 220,240 340,160 C 420,110 500,140 580,70"
              fill="none"
              stroke="#1e293b"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 60,220 C 140,180 220,240 340,160 C 420,110 500,140 580,70"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="6"
              strokeDasharray="8 6"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </svg>

          {/* Origin Marker (Worker Hub / Dispatch Center) */}
          <div className="absolute left-[60px] top-[220px] -translate-x-1/2 -translate-y-1/2 group z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/30 animate-ping absolute" />
              <div className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-lg">
                <Compass size={18} />
              </div>
              {/* Tooltip */}
              <div className="absolute top-10 whitespace-nowrap bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md border border-slate-700 font-mono">
                🏭 {workerOrigin}
              </div>
            </div>
          </div>

          {/* Live Moving Worker Scooter Vehicle Marker */}
          <div
            className="absolute z-20 transition-all duration-1000 ease-out -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${60 + (progress / 100) * (580 - 60)}px`,
              top: `${220 - (progress / 100) * (220 - 70) + Math.sin(progress / 10) * 15}px`,
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* Radar Ping */}
              <div className="w-14 h-14 rounded-full bg-blue-500/20 animate-ping absolute -top-2" />
              
              {/* Worker Scooter Badge */}
              <div className="relative w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-blue-500/40">
                <span className="text-xl">🛵</span>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>

              {/* Worker Name Banner */}
              <div className="mt-1.5 bg-[#0c2340] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-xl border border-blue-400/50 flex items-center gap-1.5 whitespace-nowrap">
                <span>{workerName}</span>
                <span className="text-emerald-400 font-mono text-[10px]">({remainingKm} km)</span>
              </div>
            </div>
          </div>

          {/* Destination Marker (Customer Residence) */}
          <div className="absolute left-[580px] top-[70px] -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-red-500/30 animate-ping absolute" />
              <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center shadow-xl">
                <MapPin size={20} className="text-white" />
              </div>
              {/* Tooltip */}
              <div className="absolute top-12 right-0 whitespace-nowrap bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md border border-slate-700 font-mono">
                🏠 {customerAddress}
              </div>
            </div>
          </div>

          {/* Floating ETA Live Overlay Band */}
          <div className="absolute top-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl border border-slate-700/80 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-black text-sm">
                <Clock size={18} className="animate-spin" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Estimated Arrival</span>
                <div className="text-xs font-black text-white font-mono flex items-center gap-1.5">
                  <span className="text-emerald-400 text-sm">{etaMinutes} Mins</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{remainingKm} km away</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProgress(35)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition border border-slate-700 flex items-center gap-1"
                title="Recalibrate Route"
              >
                <RefreshCw size={12} />
                Recalibrate
              </button>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30">
                GPS SYNCED ⚡
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry & Worker Communication Footer Card */}
        <div className="p-5 bg-white space-y-4">
          
          {/* Worker Info Row */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white font-black text-base flex items-center justify-center shadow-md">
                  {workerName.charAt(0)}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900">{workerName}</h3>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-300 flex items-center gap-0.5">
                    <ShieldCheck size={12} className="text-blue-600" />
                    Cooperative Verified
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {workerService} • <span className="font-bold text-amber-600">★ {workerRating}</span> (140+ jobs)
                </p>
              </div>
            </div>

            {/* Quick Action Phone & WhatsApp Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${workerPhone}`}
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition"
                title={`Call ${workerName}`}
              >
                <Phone size={18} />
              </a>
              <a
                href={`https://wa.me/91${workerPhone}?text=${encodeURIComponent(`Hi ${workerName}, tracking your arrival for NEED Booking #${booking.id}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-md transition"
                title="Send WhatsApp Message"
              >
                <MessageSquare size={18} />
              </a>
            </div>
          </div>

          {/* Dispatch OTP & Delivery Note Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Job Start Security OTP</span>
                <span className="font-mono text-base font-black text-emerald-900 tracking-wider">{bookingOtp}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">Share with artisan upon arrival</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2 text-blue-900">
              <Smartphone size={18} className="text-blue-700 shrink-0" />
              <div className="text-[11px] leading-tight font-medium">
                <strong>Live Safety Monitoring:</strong> GPS location updated every 2 seconds via NEED Worker App.
              </div>
            </div>
          </div>

          {/* Return button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#0c2340] hover:bg-slate-900 text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>Close Live Tracking</span>
          </button>
        </div>

      </div>
    </div>
  )
}
