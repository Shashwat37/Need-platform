/**
 * Logo.jsx — the NEED brand mark.
 */
export default function Logo({ showText = true, className = 'h-9 w-9' }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#007A55" />
        <path
          d="M7 23v-4a9 9 0 0 1 18 0v4"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M5 23h22" stroke="#FEA619" strokeWidth="2.2" strokeLinecap="round" />
        <path
          d="M12 23v-3.5M20 23v-3.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      {showText && (
        <span className="font-display text-xl font-black tracking-wider text-ink uppercase">
          NE<span className="text-brand-600">ED</span>
        </span>
      )}
    </span>
  )
}
