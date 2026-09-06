/**
 * DemandForecastingPage.jsx — Dedicated Public AI Demand Forecasting Page.
 *
 * Provides a dedicated standalone interface for teachers, administrators,
 * cooperative leaders, and citizens to inspect real-time machine learning
 * demand forecasting, weather telemetry, and capacity calculations.
 */

import { Link } from 'react-router-dom'
import {
  BrainCircuit,
  CloudRain,
  Database,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import AIDemandForecastCard from '../components/AIDemandForecastCard'

export default function DemandForecastingPage() {
  return (
    <div className="w-full bg-surface pb-20 pt-4">
      <div className="container-page space-y-8">
        
        {/* ── Page Hero Banner ────────────────────────────────────────────── */}
        <div className="relative rounded-3xl bg-surface-container-lowest border border-outline-variant/60 p-6 sm:p-10 shadow-sm overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <BrainCircuit size={14} className="text-primary" />
                <span>scikit-learn RandomForestRegressor</span>
              </span>
              <span className="bg-secondary-fixed/40 text-secondary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <CloudRain size={14} />
                <span>Open-Meteo Public Weather API</span>
              </span>
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-4xl text-on-surface font-extrabold tracking-tight">
              AI Demand Forecasting &amp; Predictive Worker Dispatch
            </h1>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-medium">
              Autonomous machine learning engine forecasting citizen household service demand, rainfall waterlogging risks,
              and transparent cooperative artisan capacity allocation across Delhi-NCR.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                <ShieldCheck size={16} className="text-primary" />
                <span>Zero Surge Exploitation</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                <Database size={16} className="text-secondary" />
                <span>10-Dimensional ML Feature Matrix</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                <MapPin size={16} className="text-amber-700" />
                <span>Rohini, Dwarka, Noida &amp; NCR Clusters</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Core Interactive Machine Learning Console ──────────────────── */}
        <AIDemandForecastCard defaultLocation="Rohini" />

        {/* ── Architecture & Academic Demonstration Notes ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-sm text-on-surface">Weather &amp; Environmental Telemetry</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Consumes live precipitation, temperature, and WMO weather codes from public meteorological sources
              to predict household stress factors such as basement waterlogging and electrical tripping.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed/40 text-secondary flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-sm text-on-surface">RandomForestRegressor ML Model</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Trains on multi-season baseline observations encompassing monsoon rains, summer heatwaves,
              and festive seasons to estimate exact trade demand across plumbing, electrical, and home care.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-sm text-on-surface">Transparent Capacity Mathematics</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Applies transparent formula <code className="text-primary font-bold">Required &minus; Available = Additional</code> to mobilize
              cooperative guild artisans without surge pricing or unfair gig commissions.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
