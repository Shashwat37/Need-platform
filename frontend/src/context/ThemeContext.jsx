/**
 * ThemeContext.jsx — Persistent Dark / Light Theme Context for NEED.
 *
 * Provides theme state ('light' | 'dark'), toggleTheme(), and persists
 * preference to localStorage ('need_theme'). Automatically applies .dark
 * to <html> and <body>.
 */

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('need_theme')
      if (saved === 'dark' || saved === 'light') return saved
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    } catch (e) {}
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
      document.body.classList.add('dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      document.body.classList.remove('dark')
    }
    try {
      localStorage.setItem('need_theme', theme)
    } catch (e) {}
  }, [theme])

  function toggleTheme() {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  function setTheme(newTheme) {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
