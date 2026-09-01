import { Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import About from './pages/About'
import AdminDashboard from './pages/AdminDashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import WorkerDashboard from './pages/WorkerDashboard'
import SupportPage from './pages/SupportPage'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Register from './pages/Register'
import ServicesPage from './pages/ServicesPage'
import PagePlaceholder from './components/PagePlaceholder'

/**
 * App.jsx — the map of URLs to pages.
 *
 * HOW TO READ THIS: the outer <Route> has no path and renders <Layout />, so
 * every page nested inside it automatically gets the navbar and footer. The
 * child with `index` is the one shown at "/". The child with path="*" catches
 * anything that matched nothing else.
 *
 * Protected routes are wrapped in <ProtectedRoute> — they redirect to /login
 * if no session is found. A requiredRole prop limits access to one role only.
 *
 * New pages in later steps get added as one more line inside the relevant block.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route index element={<LandingPage />} />
        <Route path="/services"  element={<ServicesPage />} />
        <Route path="/about"     element={<About />} />
        <Route path="/help"      element={<SupportPage />} />
        <Route path="/support"   element={<SupportPage />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />

        {/* Protected: Customer */}
        <Route element={<ProtectedRoute requiredRole="customer" />}>
          <Route path="/customer" element={<CustomerDashboard />} />
        </Route>

        {/* Protected: Worker */}
        <Route element={<ProtectedRoute requiredRole="worker" />}>
          <Route path="/worker" element={<WorkerDashboard />} />
        </Route>

        {/* Protected: Admin */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
