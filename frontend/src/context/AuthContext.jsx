/**
 * AuthContext.jsx — global login state for NEED.
 *
 * WHAT: A React context that tells every component who is logged in.
 * WHY:  Without a context, each page would need to re-fetch /api/auth/me
 *       independently, and the navbar would have no way to know the username.
 * HOW:
 *   1. <AuthProvider> wraps the whole app in main.jsx.
 *   2. On mount it calls GET /api/auth/me to restore the session after a
 *      page refresh (so the user stays logged in).
 *   3. Components call `useAuth()` to read `user`, call `login()`, or
 *      call `logout()`.
 *
 * The `loading` flag is true only during the initial /me check. Pages that
 * need auth can show a spinner until loading is false.
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getMe, loginUser, logoutUser, registerUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // true while we check /me

  // On first render, ask the server if the browser already has a valid
  // session cookie. This restores login state after a page refresh.
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null)) // 401 = not logged in, that is fine
      .finally(() => setLoading(false))
  }, [])

  /** Call the login endpoint, store the returned user. */
  const login = useCallback(async (email, password) => {
    const userData = await loginUser(email, password)
    setUser(userData)
    return userData
  }, [])

  /** Register a new account, then automatically log them in. */
  const register = useCallback(async (data) => {
    const userData = await registerUser(data)
    setUser(userData)
    return userData
  }, [])

  /** Clear the server session and local state. */
  const logout = useCallback(async () => {
    await logoutUser()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth() — the hook components call to access auth state.
 *
 * Example:
 *   const { user, logout } = useAuth()
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
