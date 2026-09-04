/**
 * tailwind.config.js — the NEED design system.
 *
 * WHAT: Defines our brand colours and fonts as reusable names.
 * WHY:  Writing `bg-brand-600` everywhere means we can change the brand colour
 *       in ONE place instead of hunting through every file.
 * HOW:  Tailwind reads this file and generates only the CSS classes we use.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep ink navy — headings and dark sections. Like the ink on an
        // official cooperative document.
        ink: {
          DEFAULT: '#131B2E',
          900: '#0F172A',
          800: '#131B2E',
          700: '#334155',
          600: '#475569',
        },
        // Cooperative teal — every main button and link.
        brand: {
          50: '#E6F7F0',
          100: '#B8EBD7',
          200: '#8DDEC0',
          500: '#007A55',
          600: '#005F41',
          700: '#005137',
        },
        // Marigold — our single accent colour, used sparingly.
        marigold: {
          50: '#FFF4DF',
          400: '#FFB95F',
          500: '#FEA619',
          600: '#855300',
        },
        // Status colours. Green is reserved ONLY for "verified", so that
        // green always means one thing in this app and never decorates.
        verified: '#1B9C4B',
        pending: '#C98A04',
        rejected: '#C0392B',

        paper: '#FAF8FF', // page background
        line: '#BDC9C1',  // borders
        muted: '#64748B', // secondary text
      },
      fontFamily: {
        // Archivo is bold and squarish, like hand-painted tradesmen signboards.
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        // IBM Plex Sans reads cleanly and has a matching Devanagari family,
        // which we will need when Hindi is added in Step 16.
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        // Monospace for IDs, prices and invoice numbers — the "receipt" feel.
        mono: ['"Plus Jakarta Sans"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 4px rgba(19,27,46,0.04), 0 8px 24px -12px rgba(19,27,46,0.14)',
        lift: '0 2px 8px rgba(19,27,46,0.06), 0 16px 40px -16px rgba(19,27,46,0.18)',
      },
      maxWidth: {
        content: '1180px',
      },
      // The modals (booking, payment, invoice) all use `animate-fade-in` to
      // appear gently instead of snapping onto the screen. Tailwind only knows
      // the animations we declare here, so this is where that class comes from.
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
      },
    },
  },
  plugins: [],
}
