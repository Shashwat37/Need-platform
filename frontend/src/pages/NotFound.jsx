import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * NotFound.jsx — shown for any URL that does not match a route.
 * The "*" path in App.jsx sends unknown addresses here.
 */
export default function NotFound() {
  return (
    <div className="container-page py-28">
      <div className="mx-auto max-w-md text-center">
        <p className="font-mono text-sm tracking-[0.18em] text-brand-700">404</p>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">
          This page does not exist
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          The address may be mistyped, or the page belongs to a part of ShramSetu
          that has not been built yet.
        </p>
        <Link to="/" className="btn btn-primary mt-8">
          <ArrowLeft size={17} />
          Back to home
        </Link>
      </div>
    </div>
  )
}
