/**
 * CooperativeDashboard.jsx — Dashboard for Labour Cooperative / Society Administrators.
 *
 * Dedicated dashboard enabling cooperative leaders to:
 *  1. View & manage worker profiles, verify skills & identity.
 *  2. Add new worker members to the society.
 *  3. Dispatch & assign workers to customer bookings.
 *  4. Inspect transparent earnings breakdown (Cooperative 5% share, worker payouts).
 *  5. Assist with dispute resolution.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  Loader2,
  PlusCheck,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import {
  cooperativeAddWorker,
  cooperativeAssignWorker,
  cooperativeVerifyWorker,
  getCooperativeDashboard,
  resolveDispute,
} from '../services/api'

export default function CooperativeDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('workers') // 'workers' | 'bookings' | 'financials' | 'disputes'

  // Modals state
  const [showAddWorker, setShowAddWorker] = useState(false)
  const [newWorkerForm, setNewWorkerForm] = useState({
    name: '',
    email: '',
    phone: '',
    primary_service: 'Electrician',
    skills: '',
    experience_years: 3,
  })
  const [addingWorker, setAddingWorker] = useState(false)

  const [assignModal, setAssignModal] = useState({ isOpen: false, booking: null })
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [assigning, setAssigning] = useState(false)

  const [disputeModal, setDisputeModal] = useState({ isOpen: false, dispute: null })
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const res = await getCooperativeDashboard()
      setData(res)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load cooperative dashboard.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyWorker(workerId, status) {
    try {
      await cooperativeVerifyWorker(workerId, status, 'Verified by Cooperative Admin')
      fetchDashboardData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update verification.')
    }
  }

  async function handleAddWorker(e) {
    e.preventDefault()
    setAddingWorker(true)
    try {
      await cooperativeAddWorker(newWorkerForm)
      setShowAddWorker(false)
      setNewWorkerForm({ name: '', email: '', phone: '', primary_service: 'Electrician', skills: '', experience_years: 3 })
      fetchDashboardData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add worker.')
    } finally {
      setAddingWorker(false)
    }
  }

  async function handleAssignWorker(e) {
    e.preventDefault()
    if (!selectedWorkerId) return
    setAssigning(true)
    try {
      await cooperativeAssignWorker(assignModal.booking.id, selectedWorkerId)
      setAssignModal({ isOpen: false, booking: null })
      fetchDashboardData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign worker.')
    } finally {
      setAssigning(false)
    }
  }

  async function handleResolveDispute(e) {
    e.preventDefault()
    setResolving(true)
    try {
      await resolveDispute(disputeModal.dispute.id, 'resolved', resolutionNotes)
      setDisputeModal({ isOpen: false, dispute: null })
      setResolutionNotes('')
      fetchDashboardData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resolve dispute.')
    } finally {
      setResolving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={36} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <h3 className="font-bold text-base">{error}</h3>
        </div>
      </div>
    )
  }

  const { cooperative, stats, workers, bookings, disputes } = data

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Cooperative Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/20">
              <Building2 size={32} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/30 mb-1">
                <ShieldCheck size={14} />
                {cooperative?.verification_badge || 'Government Registered Society'}
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
                {cooperative?.name || 'Labour Cooperative Federation'}
              </h1>
              <p className="text-xs text-brand-200 mt-0.5">
                Reg No: {cooperative?.registration_number} • {cooperative?.city}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddWorker(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-brand-900 shadow-md hover:bg-stone-100 transition"
          >
            <UserPlus size={16} />
            Add Worker Member
          </button>
        </div>

        {/* Top KPIs */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-white/10 pt-6">
          <div>
            <span className="text-[11px] text-brand-200">Total Members</span>
            <div className="text-xl font-bold text-white mt-0.5">{stats.total_workers}</div>
          </div>
          <div>
            <span className="text-[11px] text-brand-200">Verified Skill Partners</span>
            <div className="text-xl font-bold text-emerald-300 mt-0.5">{stats.verified_workers}</div>
          </div>
          <div>
            <span className="text-[11px] text-brand-200">Completed Services</span>
            <div className="text-xl font-bold text-white mt-0.5">{stats.total_jobs_completed}</div>
          </div>
          <div>
            <span className="text-[11px] text-brand-200">Cooperative Share (5%)</span>
            <div className="text-xl font-bold text-amber-300 mt-0.5">₹{stats.cooperative_share_earnings}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-line mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('workers')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'workers'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Users size={16} />
          Worker Members ({workers.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'bookings'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Wrench size={16} />
          Service Requests ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'financials'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <DollarSign size={16} />
          Transparent Earnings
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'disputes'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <AlertTriangle size={16} />
          Disputes ({disputes.length})
        </button>
      </div>

      {/* TAB 1: Managed Workers */}
      {activeTab === 'workers' && (
        <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-line flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-ink">Cooperative Member Roster</h3>
            <span className="text-xs text-muted">Skill & Identity Verification Control</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-line">
                <tr>
                  <th className="p-3">Worker</th>
                  <th className="p-3">Trade & Skills</th>
                  <th className="p-3">Experience</th>
                  <th className="p-3">Trust Badges</th>
                  <th className="p-3">Completed Jobs</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {workers.map((w) => (
                  <tr key={w.worker_id} className="hover:bg-stone-50/50">
                    <td className="p-3">
                      <div className="font-bold text-ink">{w.name}</div>
                      <div className="text-[11px] text-muted">{w.email} • {w.phone}</div>
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                        {w.primary_service}
                      </span>
                      <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">{w.skills}</p>
                    </td>
                    <td className="p-3 font-semibold text-stone-700">{w.experience_years} Years</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                          🛡️ Identity Verified
                        </span>
                        <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-bold">
                          ⚡ Skill Verified
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-stone-800">{w.total_jobs} Jobs</td>
                    <td className="p-3 text-right">
                      {w.verification_status === 'pending' ? (
                        <button
                          onClick={() => handleVerifyWorker(w.user_id, 'verified')}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-white font-bold text-[11px] hover:bg-emerald-700"
                        >
                          Verify Member
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs flex items-center justify-end gap-1">
                          <CheckCircle2 size={14} /> Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Service Requests */}
      {activeTab === 'bookings' && (
        <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-line flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-ink">Incoming & Assigned Service Requests</h3>
            <span className="text-xs text-muted">Society Dispatch Control</span>
          </div>

          <div className="divide-y divide-line">
            {bookings.map((b) => (
              <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-ink">Booking #{b.id}</span>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700 uppercase">
                      {b.status}
                    </span>
                    {b.is_emergency && (
                      <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold">
                        🚨 Emergency Dispatch
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-brand-800 mt-1">{b.service_name}</h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Customer: <strong>{b.customer_name}</strong> • {b.address}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Assigned Worker: <strong>{b.worker_name || 'Unassigned'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-sm text-ink">₹{b.amount}</div>
                    <div className="text-[10px] text-muted">Coop Share: ₹{round(b.amount * 0.05)}</div>
                  </div>

                  {(!b.worker_id || b.status === 'requested' || b.status === 'pending') && (
                    <button
                      onClick={() => setAssignModal({ isOpen: true, booking: b })}
                      className="rounded-xl bg-brand-600 px-4 py-2 text-white font-bold text-xs hover:bg-brand-700"
                    >
                      Assign Worker
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Transparent Earnings */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
              <span className="text-xs text-muted">Total Gross Volume (GMV)</span>
              <div className="text-2xl font-extrabold text-ink mt-1">₹{stats.total_gmv}</div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-xs">
              <span className="text-xs text-amber-800 font-semibold">Cooperative Share (5%)</span>
              <div className="text-2xl font-extrabold text-amber-900 mt-1">₹{stats.cooperative_share_earnings}</div>
              <p className="text-[11px] text-amber-700 mt-1">Reinvested in worker training & equipment</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-xs">
              <span className="text-xs text-emerald-800 font-semibold">Worker Net Earnings (85%)</span>
              <div className="text-2xl font-extrabold text-emerald-900 mt-1">₹{stats.worker_total_earnings}</div>
              <p className="text-[11px] text-emerald-700 mt-1">Paid directly to worker bank accounts</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <h3 className="font-display text-base font-bold text-ink mb-2">Transparent Earnings Model Explanation</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              In the NEED Cooperative Marketplace, every rupee paid by a customer is distributed transparently:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-stone-50 p-4 border border-line text-xs">
                <span className="font-bold text-ink block mb-1">10% Platform Fee</span>
                Covers server infrastructure, AI demand forecasting & app operations.
              </div>
              <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block mb-1">5% Cooperative Share</span>
                Funds local society administration, skill certification & worker emergency support.
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs text-emerald-900">
                <span className="font-bold block mb-1">85% Worker Take-Home</span>
                Retained by the worker partner (10% auto-funds their Welfare Wallet).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Disputes */}
      {activeTab === 'disputes' && (
        <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-line">
            <h3 className="font-display text-sm font-bold text-ink">Active Disputes & Quality Reviews</h3>
          </div>

          {disputes.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">No active disputes reported.</div>
          ) : (
            <div className="divide-y divide-line">
              {disputes.map((d) => (
                <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-ink">Dispute #{d.id}</span>
                      <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                        {d.category}
                      </span>
                      <span className="rounded-full bg-stone-100 text-stone-700 px-2 py-0.5 text-[10px] font-bold">
                        Status: {d.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 mt-1 font-medium">{d.description}</p>
                    <p className="text-[11px] text-muted mt-0.5">Raised by: {d.raised_by_name} ({d.raised_by_role})</p>
                  </div>

                  {d.status === 'open' && (
                    <button
                      onClick={() => setDisputeModal({ isOpen: true, dispute: d })}
                      className="rounded-xl bg-amber-600 px-4 py-2 text-white font-bold text-xs hover:bg-amber-700"
                    >
                      Resolve Dispute
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Add Worker Member */}
      {showAddWorker && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <h3 className="font-display text-base font-bold text-ink">Add Worker Member to Cooperative</h3>
              <button onClick={() => setShowAddWorker(false)} className="text-muted hover:text-ink"><X size={20} /></button>
            </div>

            <form onSubmit={handleAddWorker} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Full Name</label>
                <input
                  type="text" required
                  value={newWorkerForm.name}
                  onChange={(e) => setNewWorkerForm({ ...newWorkerForm, name: e.target.value })}
                  placeholder="e.g. Dinesh Verma"
                  className="w-full rounded-xl border border-line p-2 text-xs focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Email</label>
                <input
                  type="email" required
                  value={newWorkerForm.email}
                  onChange={(e) => setNewWorkerForm({ ...newWorkerForm, email: e.target.value })}
                  placeholder="dinesh@example.com"
                  className="w-full rounded-xl border border-line p-2 text-xs focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Phone Number</label>
                <input
                  type="tel" required
                  value={newWorkerForm.phone}
                  onChange={(e) => setNewWorkerForm({ ...newWorkerForm, phone: e.target.value })}
                  placeholder="9820001122"
                  className="w-full rounded-xl border border-line p-2 text-xs focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Primary Trade</label>
                <select
                  value={newWorkerForm.primary_service}
                  onChange={(e) => setNewWorkerForm({ ...newWorkerForm, primary_service: e.target.value })}
                  className="w-full rounded-xl border border-line p-2 text-xs focus:border-brand-500"
                >
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="AC Service">AC Service</option>
                  <option value="Cleaner">Cleaner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Skills Description</label>
                <input
                  type="text"
                  value={newWorkerForm.skills}
                  onChange={(e) => setNewWorkerForm({ ...newWorkerForm, skills: e.target.value })}
                  placeholder="e.g. Wiring, MCB fitting, Fan repair"
                  className="w-full rounded-xl border border-line p-2 text-xs focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-line">
                <button type="button" onClick={() => setShowAddWorker(false)} className="rounded-xl border border-line px-4 py-2 text-xs">Cancel</button>
                <button type="submit" disabled={addingWorker} className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white">
                  {addingWorker ? <Loader2 className="animate-spin" size={16} /> : 'Register Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Assign Worker */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <h3 className="font-display text-base font-bold text-ink">Assign Member to Booking #{assignModal.booking?.id}</h3>
              <button onClick={() => setAssignModal({ isOpen: false, booking: null })} className="text-muted"><X size={20} /></button>
            </div>

            <form onSubmit={handleAssignWorker} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Select Available Cooperative Worker</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full rounded-xl border border-line p-2.5 text-xs"
                >
                  <option value="">-- Choose Worker Member --</option>
                  {workers.map((w) => (
                    <option key={w.worker_id} value={w.user_id}>
                      {w.name} ({w.primary_service} — {w.rating}★)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-line">
                <button type="button" onClick={() => setAssignModal({ isOpen: false, booking: null })} className="rounded-xl border border-line px-4 py-2 text-xs">Cancel</button>
                <button type="submit" disabled={assigning || !selectedWorkerId} className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white">
                  {assigning ? <Loader2 className="animate-spin" size={16} /> : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Resolve Dispute */}
      {disputeModal.isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <h3 className="font-display text-base font-bold text-ink">Resolve Dispute #{disputeModal.dispute?.id}</h3>
              <button onClick={() => setDisputeModal({ isOpen: false, dispute: null })} className="text-muted"><X size={20} /></button>
            </div>

            <form onSubmit={handleResolveDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Resolution Notes</label>
                <textarea
                  rows={4} required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain resolution findings and action taken..."
                  className="w-full rounded-xl border border-line p-3 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-line">
                <button type="button" onClick={() => setDisputeModal({ isOpen: false, dispute: null })} className="rounded-xl border border-line px-4 py-2 text-xs">Cancel</button>
                <button type="submit" disabled={resolving} className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white">
                  {resolving ? <Loader2 className="animate-spin" size={16} /> : 'Mark Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function round(val) {
  return Math.round((val || 0) * 100) / 100
}
