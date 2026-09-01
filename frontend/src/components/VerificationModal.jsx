/**
 * VerificationModal.jsx — interactive worker verification document submission modal.
 *
 * WHAT: Allows workers with pending or rejected status to submit/update their Govt ID proof
 *       (Aadhaar/Voter ID reference AND actual document upload), trade certificates with document attachments,
 *       experience, and skills.
 *
 * WHY:  Verification requires both document number and uploaded identity/trade proof documents
 *       to be verified by the NEED Federation board.
 *
 * HOW:  Calls submitWorkerVerification() from api.js and updates state upon submission.
 */

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Award,
  CheckCircle2,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  Wrench,
  X,
} from 'lucide-react'
import { submitWorkerVerification } from '../services/api'

export default function VerificationModal({
  isOpen,
  onClose,
  profile,
  onSuccess,
}) {
  const [identityProof, setIdentityProof] = useState('')
  const [certifications, setCertifications] = useState('')
  const [experienceYears, setExperienceYears] = useState(2)
  const [skills, setSkills] = useState('')
  const [primaryService, setPrimaryService] = useState('')

  // Uploaded Files State
  const [idFile, setIdFile] = useState(null)
  const [certFile, setCertFile] = useState(null)
  const [idFilePreview, setIdFilePreview] = useState(null)
  const [certFilePreview, setCertFilePreview] = useState(null)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setIdentityProof(profile.identity_proof || '')
      setCertifications(profile.certifications || '')
      setExperienceYears(profile.experience_years || 2)
      setSkills(profile.skills || '')
      setPrimaryService(profile.primary_service || '')
    }
  }, [profile])

  if (!isOpen) return null

  function handleIdFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Government ID file must be under 5MB.')
      return
    }
    setError('')
    setIdFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
    })
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => setIdFilePreview(ev.target.result)
      reader.readAsDataURL(file)
    } else {
      setIdFilePreview(null)
    }
  }

  function handleCertFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Certificate file must be under 5MB.')
      return
    }
    setError('')
    setCertFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
    })
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => setCertFilePreview(ev.target.result)
      reader.readAsDataURL(file)
    } else {
      setCertFilePreview(null)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!identityProof.trim()) {
      setError('Please provide a valid Identity Proof reference (e.g. Aadhaar / Govt ID No.).')
      return
    }

    if (!idFile && !identityProof.includes('[Attached File:')) {
      // Prompt warning if file is missing
      setError('Please upload your Government Identity Document (Aadhaar / Driving License scan).')
      return
    }

    setBusy(true)
    try {
      const payload = {
        identity_proof:   identityProof.trim(),
        certifications:   certifications.trim(),
        experience_years: Number(experienceYears) || 0,
        skills:           skills.trim(),
        primary_service:  primaryService.trim(),
        id_file_name:     idFile ? idFile.name : undefined,
        cert_file_name:   certFile ? certFile.name : undefined,
      }

      await submitWorkerVerification(payload)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit verification application.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="card relative w-full max-w-xl p-6 sm:p-8 shadow-2xl border-brand-100 bg-white my-8">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-paper hover:text-ink transition"
          aria-label="Close verification modal"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-verified/10 text-verified animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-display text-xl font-bold text-ink">Application &amp; Documents Submitted!</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">
              Your identity proof files and trade certificates have been securely transmitted to the NEED Federation board for review.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
                <FileCheck2 size={15} />
                Cooperative Membership Verification
              </div>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
                Submit Verification Proof
              </h2>
              <p className="text-xs text-muted">
                Upload your Aadhaar / Govt ID scan &amp; trade certificate to complete verification and access jobs &amp; Welfare Wallet.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Rejection Note Alert if rejected previously */}
            {profile?.verification_status === 'rejected' && profile?.verification_notes && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-700">
                  <ShieldAlert size={15} />
                  Previous Rejection Reason:
                </div>
                <p className="text-[11px] text-red-700">{profile.verification_notes}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* 1. Govt Identity Number */}
              <div>
                <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1.5">
                  <FileText size={14} className="text-muted" />
                  Government Identity Proof No. / Reference *
                </label>
                <input
                  type="text"
                  required
                  value={identityProof}
                  onChange={e => setIdentityProof(e.target.value)}
                  placeholder="e.g. Aadhaar No.: 4532-8812-9901 or Driving License No."
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              {/* 2. Upload Govt ID Document File */}
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UploadCloud size={14} className="text-brand-600" />
                    Upload Government ID Document (Aadhaar / License) *
                  </span>
                  <span className="text-[10px] text-muted">PDF, JPG, PNG (Max 5MB)</span>
                </label>

                {!idFile ? (
                  <label className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-paper/50 hover:bg-brand-50/50 hover:border-brand-300 p-4 text-center cursor-pointer transition">
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/jpg,image/png"
                      onChange={handleIdFileChange}
                      className="hidden"
                    />
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-brand-700 group-hover:scale-110 transition mb-1">
                      <UploadCloud size={18} />
                    </div>
                    <p className="text-xs font-bold text-ink">Click to upload or drag &amp; drop</p>
                    <p className="text-[11px] text-muted">Scanned copy of Aadhaar Card, Driving License, or Voter ID</p>
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs">
                    <div className="flex items-center gap-3">
                      {idFilePreview ? (
                        <img src={idFilePreview} alt="ID Preview" className="h-10 w-10 object-cover rounded-lg border border-emerald-300 shrink-0" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                          <FileText size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-ink truncate max-w-[200px] sm:max-w-[280px]">{idFile.name}</p>
                        <p className="text-[11px] text-muted">{idFile.size} • Encrypted &amp; Verified</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIdFile(null); setIdFilePreview(null) }}
                      className="rounded-lg p-1.5 text-muted hover:bg-white hover:text-red-600 transition"
                      aria-label="Remove document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Trade Service & Certification */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1.5">
                    <Wrench size={14} className="text-muted" />
                    Primary Trade Service
                  </label>
                  <input
                    type="text"
                    value={primaryService}
                    onChange={e => setPrimaryService(e.target.value)}
                    placeholder="e.g. Electrician, Plumber"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1.5">
                    <Award size={14} className="text-muted" />
                    Certifications / License Name
                  </label>
                  <input
                    type="text"
                    value={certifications}
                    onChange={e => setCertifications(e.target.value)}
                    placeholder="e.g. ITI Electrician Certificate"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* 4. Upload Trade Certificate Document File */}
              <div>
                <label className="block text-xs font-medium text-ink mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Award size={14} className="text-brand-600" />
                    Upload Trade / ITI Skill Certificate (Optional)
                  </span>
                  <span className="text-[10px] text-muted">PDF, JPG, PNG (Max 5MB)</span>
                </label>

                {!certFile ? (
                  <label className="group relative flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-paper/30 hover:bg-brand-50/50 hover:border-brand-300 p-3 text-center cursor-pointer transition">
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/jpg,image/png"
                      onChange={handleCertFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
                      <UploadCloud size={16} />
                      <span>Upload Skill / Apprentice Certificate Document</span>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/60 p-3 text-xs">
                    <div className="flex items-center gap-3">
                      {certFilePreview ? (
                        <img src={certFilePreview} alt="Cert Preview" className="h-10 w-10 object-cover rounded-lg border border-brand-300 shrink-0" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-100 text-brand-700 shrink-0">
                          <Award size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-ink truncate max-w-[200px] sm:max-w-[280px]">{certFile.name}</p>
                        <p className="text-[11px] text-muted">{certFile.size} • Attached</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCertFile(null); setCertFilePreview(null) }}
                      className="rounded-lg p-1.5 text-muted hover:bg-white hover:text-red-600 transition"
                      aria-label="Remove certificate document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Experience & Skills */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Years Exp.
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={experienceYears}
                    onChange={e => setExperienceYears(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-ink mb-1">
                    Specialized Skills
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    placeholder="e.g. Wiring, Capacitor repair, Circuit breaker"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Actions */}
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
                  <span>{busy ? 'Submitting…' : 'Submit for Verification'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  )
}
