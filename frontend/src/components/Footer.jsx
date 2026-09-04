import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import Logo from './Logo'
import { useLanguage } from '../context/LanguageContext'

const COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { to: '/services', label: 'All services' },
      { to: '/register', label: 'Join as a worker' },
      { to: '/register', label: 'Book a service' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About NEED' },
      { to: '/about', label: 'Cooperative model' },
      { to: '/about', label: 'Worker welfare' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { to: '/help', label: 'Help centre' },
      { to: '/help', label: 'Terms of use' },
      { to: '/help', label: 'Privacy policy' },
    ],
  },
]

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {t('footer_tagline', 'NEED — A Cooperative-Owned Digital Home-Service Marketplace.')}
            </p>
            <div className="mt-5 space-y-2 text-sm text-muted">
              <p className="flex items-center gap-2">
                <Mail size={15} /> support@need.in
              </p>
              <p className="flex items-center gap-2">
                <Phone size={15} /> 1800 123 4567
              </p>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted transition-colors hover:text-brand-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} NEED Cooperative Federation.</p>
          <p className="font-mono">
            Student project prototype — payments are simulated, not real.
          </p>
        </div>
      </div>
    </footer>
  )
}
