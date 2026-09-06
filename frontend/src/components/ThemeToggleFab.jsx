/**
 * ThemeToggleFab.jsx — Floating Quick Theme Switcher for NEED.
 *
 * Provides a tactile, accessible 1-click Dark/Light mode toggle in the
 * bottom-left corner of the viewport, complementing the master Navbar toggle.
 */

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggleFab() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={theme === 'dark' ? 'Switch to Light Mode (Daylight)' : 'Switch to Dark Mode (Deep Forest Obsidian)'}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/70 shadow-lg hover:shadow-xl hover:border-primary/60 text-xs font-bold text-on-surface transition-all active:scale-95 group cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center transition-transform group-hover:scale-110">
          {theme === 'dark' ? (
            <Sun size={14} className="text-amber-400 animate-spin-slow" />
          ) : (
            <Moon size={14} className="text-primary group-hover:-rotate-12 transition-transform" />
          )}
        </div>
        <span className="hidden sm:inline font-semibold text-[11px] tracking-wide">
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </button>
    </div>
  )
}
