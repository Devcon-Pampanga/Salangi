import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { ROUTES } from './routes/paths';

// Auth & Protected Components
import ProtectedRoute from './routes/ProtectedRoute';

// Feature Components - Business Side (Standardized to features/business-side)
import Dashboard from './features/business-side/pages/Dashboard'
import Overview from './features/business-side/components/Overview'
import MyBusiness from './features/business-side/components/MyBusiness'
import Events from './features/business-side/components/Events'
import Reviews from './features/business-side/components/Reviews'
import Analytics from './features/business-side/components/Analytics'
import Gallery from './features/business-side/components/Gallery'
import Settings from './features/business-side/components/Settings'

// Feature Components - Main Side
import Navigator from './features/Navigator'
import Homepage from './features/dashboard/pages/Homepage'
import Locationpage from './features/dashboard/pages/Locationpage'
import Savepage from './features/dashboard/pages/Savepage'
import MapView from './map/MapView'

import Signin from './features/auth/pages/Signin'
import Register from './features/auth/pages/Register'
import ForgotPassword from './features/auth/pages/ForgotPassword'
import ResetPassword from './features/auth/pages/ResetPassword'
import BusinessRegister from './features/auth/pages/BusinessRegister'
import BusinessSignin from './features/auth/pages/BusinessSignin'
import HeroListBusiness from './features/dashboard/pages/HeroListBusiness'
import ListBusiness from './features/business-side/components/ListBusiness'

// Feature Components - Admin Side
import AdminLogin from './features/admin/pages/AdminLogin'
import AdminDashboard from './features/admin/pages/AdminDashboard'

function AuthCallback() {
  const navigate = useNavigate()
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/home-page')
      else navigate('/sign-in')
    })
  }, [navigate]);
  return <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">Loading...</div>
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-white">
        <div className="text-2xl font-bold mb-4 animate-pulse">Loading Salangi...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/sign-up" element={session ? <Navigate to="/home-page" replace /> : <Register />} />
        <Route path={ROUTES.SIGN_IN} element={session ? <Navigate to="/home-page" replace /> : <Signin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin routes */}
        <Route path={ROUTES.ADMIN} element={<AdminLogin />} />
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />

        {/* Business Side Public Routes */}
        <Route path={ROUTES.LIST_YOUR_BUSINESS} element={<HeroListBusiness />} />
        <Route path={ROUTES.BUSINESS_REGISTER} element={<BusinessRegister />} />
        <Route path={ROUTES.BUSINESS_SIGNIN} element={<BusinessSignin />} />
        <Route path={ROUTES.LIST_BUSINESS} element={<ListBusiness />} />

        {/* Business Side Dashboard */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute session={session} redirectPath={ROUTES.BUSINESS_SIGNIN}>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD_REL.OVERVIEW} element={<Overview />} />
          <Route path={ROUTES.DASHBOARD_REL.MY_BUSINESS} element={<MyBusiness />} />
          <Route path={ROUTES.DASHBOARD_REL.EVENTS} element={<Events />} />
          <Route path={ROUTES.DASHBOARD_REL.REVIEWS} element={<Reviews />} />
          <Route path={ROUTES.DASHBOARD_REL.ANALYTICS} element={<Analytics />} />
          <Route path={ROUTES.DASHBOARD_REL.GALLERY} element={<Gallery />} />
          <Route path={ROUTES.DASHBOARD_REL.SETTINGS} element={<Settings />} />
        </Route>

        {/* Protected routes / Main Application Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute session={session} redirectPath={ROUTES.SIGN_IN}>
              <Navigator />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={ROUTES.HOME} replace />} />
          <Route path={ROUTES.HOME} element={<Homepage />} />
          <Route path={ROUTES.LOCATION} element={<Locationpage />} />
          <Route path={ROUTES.SAVE} element={<Savepage />} />
          <Route path={ROUTES.MAP} element={<MapView />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;