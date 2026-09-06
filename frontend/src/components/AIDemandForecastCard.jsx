/**
 * AIDemandForecastCard.jsx — NEED Cooperative AI Demand Forecasting Engine.
 *
 * Real Machine Learning feature powered by scikit-learn RandomForestRegressor.
 * Integrates live weather telemetry from Open-Meteo, offline deterministic demo
 * scenarios (Primary Teacher Scenario: Heavy Rain, 72% waterlogging, Rohini & Dwarka,
 * 4-9 PM peak, +120 additional workers), transparent capacity mathematics,
 * and 7-day predictive visualizations.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  CloudLightning,
  CloudRain,
  Cpu,
  Droplets,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Thermometer,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import { getAIDemandForecast } from '../services/api'

const LOCATIONS = [
  { id: 'Rohini', name: 'Rohini (North Delhi)' },
  { id: 'Dwarka', name: 'Dwarka (South-West Delhi)' },
  { id: 'Noida', name: 'Noida (Sector 18 & 62)' },
  { id: 'Delhi NCR', name: 'Delhi NCR (Central Hub)' },
  { id: 'Ghaziabad', name: 'Ghaziabad & Indirapuram' },
]

const DEMO_SCENARIOS = [
  { id: 'heavy_rain', label: '🌧️ Heavy Rain Flood Surge (Primary Demo)', icon: CloudRain },
  { id: 'summer_heatwave', label: '☀️ Summer Heatwave Surge (HVAC & AC)', icon: Sun },
  { id: 'wedding_season', label: '💍 Wedding & Festive Surge (Domestic Help)', icon: Sparkles },
]

export default function AIDemandForecastCard({ defaultLocation = 'Rohini' }) {
  const [mode, setMode] = useState('demo') // 'demo' | 'live'
  const [scenario, setScenario] = useState('heavy_rain')
  const [location, setLocation] = useState(defaultLocation)

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [showCalculationDrawer, setShowCalculationDrawer] = useState(false)

  async function runForecast(loc = location, m = mode, sc = scenario) {
    setLoading(true)
    setError('')
    try {
      const res = await getAIDemandForecast({
        location: loc,
        mode: m,
        scenario: sc,
      })
      setData(res)
    } catch (err) {
      setError(err?.response?.data?.error || 'Forecast query failed. Showing demo baseline.')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    runForecast(location, mode, scenario)
  }, [])

  function handleModeChange(newMode) {
    setMode(newMode)
    runForecast(location, newMode, scenario)
  }

  function handleScenarioChange(newScenario) {
    setScenario(newScenario)
    runForecast(location, 'demo', newScenario)
  }

  function handleLocationChange(newLoc) {
    setLocation(newLoc)
    runForecast(newLoc, mode, scenario)
  }

  const weatherEvent = data?.weather?.weather_event || 'Heavy Rain'
  const isRainy = weatherEvent.toLowerCase().includes('rain') || weatherEvent.toLowerCase().includes('storm')
  const isHot = weatherEvent.toLowerCase().includes('heat') || (data?.weather?.temperature_c || 0) >= 38

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-lg overflow-hidden space-y-0 transition-all">
      {/* ── Top Header Strip ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-950 via-primary to-emerald-900 text-white p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-3 py-0.5 text-xs font-black tracking-wider uppercase">
                <BrainCircuit size={13} className="text-emerald-300 animate-pulse" />
                Real Machine Learning Engine
              </span>
              <span className="text-xs text-white/80 font-mono">
                scikit-learn • RandomForestRegressor
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <span>AI Demand Forecasting &amp; Worker Dispatch</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Predictive service job volume, rainfall waterlogging impact, and transparent cooperative artisan mobilization across NCR clusters.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-black/30 border border-white/15 rounded-2xl p-3 text-right">
              <div className="text-[10px] text-white/70 font-bold uppercase tracking-wider">
                Model Confidence
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                {data?.confidence || 84}%
              </div>
              <div className="text-[10px] text-emerald-200/80 font-medium">
                AI-assisted demand estimate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Controls Toolbar ────────────────────────────────── */}
      <div className="bg-surface-container-low border-b border-outline-variant/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Mode & Location Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl p-1 bg-surface-container border border-outline-variant/60">
            <button
              type="button"
              onClick={() => handleModeChange('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'live'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <CloudRain size={14} />
              <span>Live Weather</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('demo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'demo'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Sparkles size={14} />
              <span>Demo Scenario</span>
            </button>
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-2 bg-surface rounded-xl border border-outline-variant/80 px-3 py-1.5 text-xs">
            <MapPin size={15} className="text-primary flex-shrink-0" />
            <span className="font-bold text-on-surface-variant">Location:</span>
            <select
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="bg-transparent font-bold text-on-surface focus:outline-none cursor-pointer pr-1"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scenario Selector (Only when Demo Mode is Active) */}
          {mode === 'demo' && (
            <div className="flex items-center gap-2 bg-surface rounded-xl border border-outline-variant/80 px-3 py-1.5 text-xs">
              <span className="font-bold text-on-surface-variant">Scenario:</span>
              <select
                value={scenario}
                onChange={(e) => handleScenarioChange(e.target.value)}
                className="bg-transparent font-bold text-primary focus:outline-none cursor-pointer pr-1"
              >
                {DEMO_SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Run Forecast Button */}
        <div>
          <button
            type="button"
            disabled={loading}
            onClick={() => runForecast(location, mode, scenario)}
            className="btn btn-primary text-xs font-black px-5 py-2.5 shadow-md flex items-center gap-2 uppercase tracking-wider"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing ML Model…</span>
              </>
            ) : (
              <>
                <Zap size={16} className="text-secondary-container" />
                <span>Run AI Forecast</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Content Area ───────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 size={36} className="animate-spin text-primary mx-auto" />
            <p className="font-bold text-sm text-on-surface">Running Random Forest Regression Model…</p>
            <p className="text-xs text-on-surface-variant">
              Computing feature matrices across weather telemetry, historical bookings, and geographic clusters.
            </p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-error-container/20 border border-error/30 text-center space-y-2">
            <AlertCircle size={28} className="text-error mx-auto" />
            <p className="font-bold text-sm text-on-surface">{error}</p>
            <button
              onClick={() => runForecast(location, 'demo', 'heavy_rain')}
              className="btn btn-outline text-xs mt-2"
            >
              Reset to Primary Demo Scenario
            </button>
          </div>
        ) : (
          <>
            {/* ── Section A: Weather Event & Impact Grid ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Weather Telemetry Card (5 cols) */}
              <div className="lg:col-span-5 bg-surface-container-low rounded-2xl p-5 border border-outline-variant/60 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                      Weather Event &amp; Conditions
                    </span>
                    <span className="text-[11px] font-mono font-bold bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                      {data?.weather?.source || 'Open-Meteo'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center text-2xl shadow-sm">
                      {isRainy ? '🌧️' : isHot ? '☀️' : '⛅'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl text-on-surface">
                        {data?.weather?.weather_event || 'Heavy Rain'}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-medium">
                        Cluster: {data?.affected_locations?.join(', ') || location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics 3-Col Bar */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline-variant/40 text-center">
                  <div className="bg-surface rounded-xl p-2.5 border border-outline-variant/30">
                    <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Temp</span>
                    <span className="font-mono font-black text-sm text-on-surface">
                      {data?.weather?.temperature_c || 26.5}°C
                    </span>
                  </div>
                  <div className="bg-surface rounded-xl p-2.5 border border-outline-variant/30">
                    <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Rainfall</span>
                    <span className="font-mono font-black text-sm text-on-surface">
                      {data?.weather?.rainfall_mm || 55.3} mm
                    </span>
                  </div>
                  <div className="bg-surface rounded-xl p-2.5 border border-outline-variant/30">
                    <span className="text-[10px] font-bold text-on-surface-variant block uppercase">Precip Prob</span>
                    <span className="font-mono font-black text-sm text-primary">
                      {data?.weather?.precipitation_probability || 95}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Expected Impact & Waterlogging Card (7 cols) */}
              <div className="lg:col-span-7 bg-surface-container-low rounded-2xl p-5 border border-outline-variant/60 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                      Expected Impact &amp; Household Stress
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      <AlertTriangle size={12} />
                      Waterlogging Probability: {data?.impact_analysis?.waterlogging_probability || 72}%
                    </span>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-on-surface font-semibold leading-relaxed">
                    {data?.impact_analysis?.expected_impact}
                  </p>
                </div>

                {/* Customer Behaviour Box */}
                <div className="bg-surface rounded-xl p-3.5 border border-outline-variant/40">
                  <div className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Users size={12} />
                    <span>Predicted Customer Behaviour</span>
                  </div>
                  <p className="text-xs text-on-surface-variant italic font-medium">
                    &ldquo;{data?.impact_analysis?.customer_behaviour}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* ── Section B: High-Demand Services & Affected Locations ──────── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Service Demand List (7 cols) */}
              <div className="md:col-span-7 bg-surface-container-low rounded-2xl p-5 border border-outline-variant/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-caps text-[10px] text-primary uppercase font-bold tracking-wider">
                      Machine Learning Forecast
                    </span>
                    <h4 className="font-bold text-sm text-on-surface">
                      Predicted Service Demand Surges
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-variant bg-surface px-2 py-0.5 rounded border border-outline-variant/30">
                    Shift Capacity Model
                  </span>
                </div>

                <div className="space-y-2">
                  {data?.predicted_services?.map((svc, idx) => {
                    const isHigh = svc.demand_level === 'HIGH'
                    return (
                      <div
                        key={idx}
                        className="bg-surface rounded-xl p-3 border border-outline-variant/40 flex items-center justify-between gap-3 shadow-xs hover:border-primary/50 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              isHigh
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container text-on-surface'
                            }`}
                          >
                            {svc.service_name === 'Plumber'
                              ? '🔧'
                              : svc.service_name === 'Electrician'
                              ? '⚡'
                              : svc.service_name === 'House Help'
                              ? '🏠'
                              : svc.service_name === 'Cleaner'
                              ? '🧹'
                              : '🛠️'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-on-surface block truncate">
                              {svc.service_name}
                            </span>
                            <span className="text-[10px] text-on-surface-variant truncate block">
                              {svc.problem_context}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 text-right">
                          <span className="font-mono text-xs font-bold text-on-surface">
                            {svc.predicted_jobs} jobs
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isHigh
                                ? 'bg-error-container/30 text-error border border-error/20'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}
                          >
                            {svc.demand_level}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Geographic Cluster & Peak Window (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                {/* Affected Locations Box */}
                <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/60 space-y-2.5">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                    Affected Locations Cluster
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {data?.affected_locations?.map((locName, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-surface text-on-surface border border-outline-variant/80 px-3 py-1 rounded-xl text-xs font-extrabold shadow-xs"
                      >
                        <MapPin size={13} className="text-secondary" />
                        <span>{locName}</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Geographic low-lying topography and high resident density elevate surge intensity in this cluster.
                  </p>
                </div>

                {/* Peak Demand Window */}
                <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/60 space-y-2">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                    Peak Demand Window
                  </span>
                  <div className="flex items-center gap-2.5 text-primary">
                    <Clock size={20} />
                    <span className="font-headline-sm text-lg font-black tracking-tight">
                      {data?.peak_time || '4 PM – 9 PM'}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Emergency response window coinciding with post-rain drainage runoff and evening household return.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Section C: Transparent Worker Requirement Calculation ───── */}
            <div className="bg-surface-container-low rounded-2xl p-5 sm:p-6 border border-outline-variant/60 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-label-caps text-[10px] text-primary uppercase font-bold tracking-wider">
                    Transparent Capacity Math
                  </span>
                  <h4 className="font-bold text-base text-on-surface">
                    Cooperative Worker Mobilization Requirement
                  </h4>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">
                  Formula: Required Artisans &minus; Available Roster = Additional Deployment
                </span>
              </div>

              {/* 4-Stat Mosaic */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-surface rounded-xl p-4 border border-outline-variant/40 text-center">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
                    Predicted Jobs
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-on-surface mt-1 block">
                    {data?.worker_calculation?.predicted_demand_jobs || 200}
                  </span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5 block font-medium">
                    Across High-Demand Trades
                  </span>
                </div>

                <div className="bg-surface rounded-xl p-4 border border-outline-variant/40 text-center">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
                    Available Workers
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-on-surface mt-1 block">
                    {data?.worker_calculation?.available_workers || 80}
                  </span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5 block font-medium">
                    Active on Roster
                  </span>
                </div>

                <div className="bg-surface rounded-xl p-4 border border-outline-variant/40 text-center">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
                    Required Workers
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-primary mt-1 block">
                    {data?.worker_calculation?.required_workers || 200}
                  </span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5 block font-medium">
                    @ 1.0 Job / Artisan Shift
                  </span>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase block">
                    Additional Workers
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 block">
                    +{data?.worker_calculation?.additional_workers || 120}
                  </span>
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 mt-0.5 block font-bold">
                    Emergency Call-out
                  </span>
                </div>
              </div>

              {/* Transparent Calculation Drawer (Expandable) */}
              <div className="border-t border-outline-variant/40 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCalculationDrawer((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  <Info size={14} />
                  <span>
                    {showCalculationDrawer
                      ? 'Hide Mathematical Derivation'
                      : 'How AI Calculated This Requirement (Expand)'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      showCalculationDrawer ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showCalculationDrawer && (
                  <div className="mt-3 p-4 rounded-xl bg-surface border border-outline-variant/50 text-xs text-on-surface space-y-2 animate-fade-in font-mono">
                    <p className="font-bold text-primary">
                      Mathematical Formula: {data?.worker_calculation?.formula}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-on-surface-variant font-sans">
                      {data?.worker_calculation?.calculation_steps?.map((step, idx) => (
                        <li key={idx} className="font-mono text-[11px] leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-on-surface-variant font-sans pt-1 border-t border-outline-variant/30">
                      <strong>Assumption:</strong> {data?.worker_calculation?.assumptions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Section D: AI Strategic Recommendation Banner ─────────────── */}
            <div className="bg-primary-container text-on-primary-container rounded-2xl p-5 border border-primary/20 flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-xs uppercase tracking-wider text-on-primary-container opacity-90">
                  Official AI Cooperative Recommendation
                </div>
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  {data?.recommendation}
                </p>
              </div>
            </div>

            {/* ── Section E: Next 7 Days Visual Forecast Matrix ─────────────── */}
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                    7-Day Predictive Horizon
                  </span>
                  <h4 className="font-bold text-sm text-on-surface">
                    Daily Projected Service Job Volume
                  </h4>
                </div>
                <span className="text-xs text-on-surface-variant font-mono">
                  Weekly Aggregate: {data?.forecast_next_7_days?.reduce((sum, d) => sum + d.predicted_jobs, 0) || 1270} bookings
                </span>
              </div>

              {/* Bar Chart Visualization */}
              <div className="grid grid-cols-7 gap-2 pt-2">
                {data?.forecast_next_7_days?.map((d, idx) => {
                  const maxJobs = 260
                  const heightPct = Math.min(100, Math.round((d.predicted_jobs / maxJobs) * 100))
                  const isHighPeak = d.predicted_jobs >= 200

                  return (
                    <div key={idx} className="flex flex-col items-center space-y-1.5 text-center">
                      <span className="text-[10px] font-mono font-bold text-on-surface-variant">
                        {d.predicted_jobs}
                      </span>
                      <div className="w-full bg-surface-container h-24 rounded-lg flex items-end p-1">
                        <div
                          className={`w-full rounded transition-all ${
                            isHighPeak
                              ? 'bg-amber-600'
                              : 'bg-primary'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-on-surface">{d.day}</span>
                      <span className="text-[10px] text-on-surface-variant truncate w-full">
                        {d.weather}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
