/**
 * ProtectedRoute.jsx — redirect to /login if not authenticated.
 *
 * WHAT: A wrapper component used in App.jsx around routes that require login.
 * WHY:  Without this, anyone could navigate to /customer or /worker directly.
 * HOW:  Reads `user` from AuthContext.
 *       - While the initial /me check is still running: show nothing (avoids
 *         a flash of the login page for already-logged-in users).
 *       - If no user: redirect to /login, remembering where they were going
 *         so we can send them back after a successful login.
 *       - If logged in: render the child page normally.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/customer" element={<CustomerDashboard />} />
 *   </Route>
 *
 * Role-restricted usage (e.g. admin only):
 *   <Route element={<ProtectedRoute requiredRole="admin" />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ requiredRole }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Still waiting for the /me check — render nothing to avoid flicker.
  if (loading) return null

  // Not logged in → go to /login, remember where we were.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role → send to their own dashboard.
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}`} replace />
  }

  // All good — render the nested route's element.
  return <Outlet />
}
