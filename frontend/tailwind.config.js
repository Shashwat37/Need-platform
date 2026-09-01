/**
 * tailwind.config.js — the ShramSetu design system.
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
          DEFAULT: '#15243B',
          900: '#0D172A',
          800: '#15243B',
          700: '#1F3555',
          600: '#2E4A70',
        },
        // Cooperative teal — every main button and link.
        brand: {
          50: '#E8F3F1',
          100: '#C8E4DF',
          200: '#A5D3CB',
          500: '#12897A',
          600: '#0E6E62',
          700: '#0B584E',
        },
        // Marigold — our single accent colour, used sparingly.
        marigold: {
          50: '#FEF6E5',
          400: '#F7B733',
          500: '#F2A104',
          600: '#D18A00',
        },
        // Status colours. Green is reserved ONLY for "verified", so that
        // green always means one thing in this app and never decorates.
        verified: '#1B9C4B',
        pending: '#C98A04',
        rejected: '#C0392B',

        paper: '#F4F6F5', // page background
        line: '#DDE4E1',  // borders
        muted: '#5B6B72', // secondary text
      },
      fontFamily: {
        // Archivo is bold and squarish, like hand-painted tradesmen signboards.
        display: ['Archivo', 'system-ui', 'sans-serif'],
        // IBM Plex Sans reads cleanly and has a matching Devanagari family,
        // which we will need when Hindi is added in Step 16.
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        // Monospace for IDs, prices and invoice numbers — the "receipt" feel.
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(21,36,59,0.04), 0 8px 24px -12px rgba(21,36,59,0.14)',
        lift: '0 2px 4px rgba(21,36,59,0.05), 0 16px 40px -16px rgba(21,36,59,0.22)',
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
