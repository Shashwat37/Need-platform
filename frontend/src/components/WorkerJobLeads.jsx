/**
 * WorkerJobLeads.jsx — Job Lead Discovery & Credit Wallet for NEED Artisans.
 * Allows verified cooperative artisans to discover relevant jobs in their area,
 * unlock verified customer contact details using lead credits, and track purchases.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  IndianRupee,
  Lock,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  Unlock,
  User,
} from 'lucide-react'
import {
  getWorkerLeads,
  unlockJobLead,
  getWorkerLeadCredits,
  topupWorkerLeadCredits,
} from '../services/api'

export default function WorkerJobLeads() {
  const [leads, setLeads] = useState([])
  const [wallet, setWallet] = useState({ balance: 0, total_spent: 0, total_leads_unlocked: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('available') // 'available' | 'unlocked'

  // Unlock Modal State
  const [confirmLead, setConfirmLead] = useState(null)
  const [unlocking, setUnlocking] = useState(false)

  // Top-Up Modal State
  const [topupModalOpen, setTopupModalOpen] = useState(false)
  const [topupAmount, setTopupAmount] = useState(250)
  const [toppingUp, setToppingUp] = useState(false)

  async function loadData(showLoading = true) {
    if (showLoading) setLoading(true)
    setError('')
    try {
      const [leadsRes, walletRes] = await Promise.all([
        getWorkerLeads(),
        getWorkerLeadCredits(),
      ])
      setLeads(leadsRes?.leads || (Array.isArray(leadsRes) ? leadsRes : []))
      setWallet(walletRes?.wallet || walletRes || { balance: 0, total_spent: 0, total_leads_unlocked: 0 })
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to load job leads and credits.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleConfirmUnlock() {
    if (!confirmLead) return
    const leadPrice = confirmLead.lead_price || 25
    if (wallet.balance < leadPrice) {
      alert(`Insufficient lead credits. Your balance is ₹${wallet.balance}, but unlocking requires ₹${leadPrice}. Please top up.`)
      setConfirmLead(null)
      setTopupModalOpen(true)
      return
    }

    setUnlocking(true)
    try {
      const res = await unlockJobLead(confirmLead.id)
      setWallet((prev) => ({
        ...prev,
        balance: res.remaining_credits ?? (prev.balance - leadPrice),
        total_leads_unlocked: (prev.total_leads_unlocked || 0) + 1,
      }))
      setLeads((prev) =>
        prev.map((l) => (l.id === confirmLead.id ? { ...l, ...res.lead, is_unlocked: true } : l))
      )
      setConfirmLead(null)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to unlock lead. Please try again.')
    } finally {
      setUnlocking(false)
    }
  }

  async function handleTopup(e) {
    if (e) e.preventDefault()
    if (!topupAmount || topupAmount <= 0) {
      alert('Please enter a valid credit amount to top up.')
      return
    }

    setToppingUp(true)
    try {
      const res = await topupWorkerLeadCredits(Number(topupAmount))
      setWallet((prev) => ({
        ...prev,
        balance: res.balance ?? (prev.balance + Number(topupAmount)),
      }))
      setTopupModalOpen(false)
      alert(res.message || `Successfully added ₹${topupAmount} lead credits!`)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to top up credits.')
    } finally {
      setToppingUp(false)
    }
  }

  const availableLeads = leads.filter((l) => !l.is_unlocked)
  const unlockedLeads = leads.filter((l) => l.is_unlocked)

  return (
    <section className="flex flex-col gap-6">
      {/* ── Top Header & Wallet Summary Band ──────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-900 via-primary to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              COOPERATIVE OPPORTUNITY NETWORK
            </span>
            <span className="text-xs text-slate-300">• Direct Resident Inquiries</span>
          </div>
          <h2 className="font-headline-md text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sparkles size={22} className="text-emerald-400" />
            Job Leads &amp; Lead Credit Wallet
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Discover verified customer requests in Noida/NCR. Pay small nominal lead credits (₹10–₹35) to unlock direct customer phone numbers and full address.
          </p>
        </div>

        {/* Wallet Credit Widget */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 z-10 self-stretch md:self-auto justify-between md:justify-start">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-300 block">
              Lead Credits Balance
            </span>
            <div className="font-mono text-3xl font-black text-white leading-none mt-1">
              ₹{(wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-300 mt-1 block">
              {wallet?.total_leads_unlocked || 0} leads unlocked to date
            </span>
          </div>

          <button
            type="button"
            onClick={() => setTopupModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
          >
            <Plus size={16} />
            <span>Top Up</span>
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'available'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            <Briefcase size={14} />
            <span>Available Leads</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
              {availableLeads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unlocked')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'unlocked'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            <Unlock size={14} />
            <span>My Unlocked Leads</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
              {unlockedLeads.length}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => loadData(false)}
          className="text-xs text-on-surface-variant hover:text-primary transition flex items-center gap-1 font-semibold"
        >
          <RefreshCw size={14} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* ── Error Banner ──────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Leads Grid ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-surface-container rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'available' ? (
        availableLeads.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-surface-container-high space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-bold text-on-surface text-base">All Caught Up!</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              You have unlocked all active job leads matching your trade category. New customer dispatches arrive regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableLeads.map((lead) => {
              const leadPrice = lead.lead_price || 25
              return (
                <div
                  key={lead.id}
                  className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-high hover:border-primary/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Header: Service & Lead Price */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {lead.service_category || 'Maintenance'}
                        </span>
                        <h4 className="font-headline-sm text-base font-bold text-on-surface mt-1">
                          {lead.service_name}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono text-on-surface-variant block">
                          Lead Price
                        </span>
                        <div className="font-mono text-lg font-black text-primary">
                          ₹{leadPrice}
                        </div>
                      </div>
                    </div>

                    {/* Scope / Notes */}
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {lead.notes || 'Routine residential service request requiring verified artisan inspection.'}
                    </p>

                    {/* Meta info tags */}
                    <div className="space-y-1.5 pt-2 border-t border-outline-variant/40 text-xs">
                      <div className="flex items-center gap-1.5 text-on-surface">
                        <MapPin size={14} className="text-primary shrink-0" />
                        <span className="font-medium truncate">{lead.address_masked || 'Sector 62, Noida (Area)'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <Clock size={14} className="text-secondary shrink-0" />
                        <span>Slot: {lead.scheduled_date} ({lead.scheduled_time})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <IndianRupee size={14} className="shrink-0 text-emerald-600" />
                        <span>Estimated Value: ₹{lead.amount || 299}</span>
                      </div>
                    </div>

                    {/* Masked Contact preview */}
                    <div className="p-2.5 rounded-xl bg-surface-container-low border border-dashed border-outline-variant text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          Customer: <strong>{lead.customer_name_masked || 'Verified Resident'}</strong>
                        </span>
                        <span className="flex items-center gap-1 text-amber-700 font-bold">
                          <Lock size={12} /> Contact Locked
                        </span>
                      </div>
                      <div className="font-mono text-on-surface-variant text-[11px]">
                        Phone: <span className="tracking-widest">+91 98•••• ••••</span>
                      </div>
                    </div>
                  </div>

                  {/* Unlock Action CTA */}
                  <button
                    type="button"
                    onClick={() => setConfirmLead(lead)}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Unlock size={14} />
                    <span>Unlock Lead (₹{leadPrice})</span>
                  </button>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* Unlocked Leads Tab */
        unlockedLeads.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-surface-container-high space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-low text-on-surface-variant mx-auto flex items-center justify-center">
              <Lock size={28} />
            </div>
            <h3 className="font-bold text-on-surface text-base">No Unlocked Leads Yet</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Switch to "Available Leads" and unlock verified customer requests to start contacting clients directly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-surface-container-lowest rounded-2xl p-5 border-2 border-emerald-500/40 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-mono font-black uppercase px-3 py-1 rounded-bl-xl shadow-xs">
                  UNLOCKED &amp; VERIFIED
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {lead.service_category || 'Maintenance'}
                    </span>
                    <h4 className="font-headline-sm text-base font-bold text-on-surface mt-1">
                      {lead.service_name}
                    </h4>
                  </div>

                  {/* Customer Full Details Revealed */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200 font-bold text-emerald-950">
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-emerald-700" />
                        {lead.customer_name || 'Resident Customer'}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-800">Direct Contact</span>
                    </div>

                    <div className="space-y-1 text-slate-800">
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-emerald-700 shrink-0" />
                        <a
                          href={`tel:${lead.customer_phone}`}
                          className="font-mono font-bold text-emerald-900 hover:underline"
                        >
                          {lead.customer_phone || '+91 98765 43210'}
                        </a>
                      </div>
                      <div className="flex items-start gap-2 text-[11px]">
                        <MapPin size={13} className="text-emerald-700 shrink-0 mt-0.5" />
                        <span>{lead.customer_address || lead.address || 'Noida Sector 62'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-on-surface-variant space-y-1">
                    <div className="flex justify-between">
                      <span>Preferred Slot:</span>
                      <span className="font-medium text-on-surface">{lead.scheduled_date} ({lead.scheduled_time})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Job Value:</span>
                      <span className="font-bold text-emerald-800 font-mono">₹{lead.amount}</span>
                    </div>
                    {lead.notes && (
                      <p className="text-[11px] text-on-surface-variant italic pt-1 border-t border-outline-variant/30">
                        "{lead.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={`tel:${lead.customer_phone || '+919876543210'}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Phone size={14} />
                  <span>Call Customer Directly</span>
                </a>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Unlock Confirmation Modal ─────────────────────────────────── */}
      {confirmLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Unlock size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-primary">Confirm Lead Unlock</span>
                <h3 className="font-bold text-lg text-on-surface">{confirmLead.service_name}</h3>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-2 text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Estimated Job Value:</span>
                <span className="font-mono font-bold text-on-surface">₹{confirmLead.amount || 299}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Location Area:</span>
                <span className="font-medium text-on-surface">{confirmLead.address_masked || 'Sector 62, Noida'}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant pt-2 border-t border-outline-variant/40">
                <span>Lead Credit Price:</span>
                <span className="font-mono font-black text-primary text-sm">₹{confirmLead.lead_price || 25}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Your Current Balance:</span>
                <span className="font-mono font-bold text-on-surface">₹{wallet.balance}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant pt-1 border-t border-outline-variant/40">
                <span>Balance After Unlock:</span>
                <span className={`font-mono font-bold ${wallet.balance - (confirmLead.lead_price || 25) < 0 ? 'text-error' : 'text-emerald-700'}`}>
                  ₹{(wallet.balance - (confirmLead.lead_price || 25)).toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Unlocking this lead debits ₹{confirmLead.lead_price || 25} from your Lead Credit Wallet. The full customer telephone number and exact apartment address will be permanently accessible in your dashboard.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmLead(null)}
                disabled={unlocking}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant font-bold text-xs text-on-surface hover:bg-surface-container transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlock}
                disabled={unlocking || wallet.balance < (confirmLead.lead_price || 25)}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {unlocking ? (
                  <span>Debiting Wallet...</span>
                ) : (
                  <span>Confirm Unlock</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top-Up Credits Modal ──────────────────────────────────────── */}
      {topupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <IndianRupee size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Top Up Lead Credits</h3>
                  <p className="text-xs text-on-surface-variant">Instant wallet reload for job lead unlocks</p>
                </div>
              </div>
              <button
                onClick={() => setTopupModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTopup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface block">
                  Select Quick Recharge Amount:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={`py-2 rounded-xl border text-xs font-mono font-bold transition ${
                        topupAmount === amt
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface block">Custom Amount (₹)</label>
                <input
                  type="number"
                  min="20"
                  max="5000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2.5 text-sm font-mono font-bold text-on-surface focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs text-on-surface-variant space-y-1">
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span className="font-mono font-bold text-on-surface">₹{wallet.balance}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Balance After Top-Up:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹{(wallet.balance + (Number(topupAmount) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTopupModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant font-bold text-xs text-on-surface hover:bg-surface-container transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={toppingUp}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5"
                >
                  {toppingUp ? (
                    <span>Processing Reload...</span>
                  ) : (
                    <span>Recharge ₹{topupAmount} ⚡</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
