import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import Homepage from './features/dashboard/pages/Homepage'
import Locationpage from './features/dashboard/pages/Locationpage'
import Savepage from './features/dashboard/pages/Savepage'
import Navigator from './features/Navigator'
import Signin from './features/auth/pages/Signin'
import Register from './features/auth/pages/Register'
import ForgotPassword from './features/auth/pages/ForgotPassword'
import ResetPassword from './features/auth/pages/ResetPassword'
import ListBusiness from './features/dashboard/components/ListBusiness'
import AdminLogin from './features/admin/pages/AdminLogin'
import AdminDashboard from './features/admin/pages/AdminDashboard'

function AuthCallback() {
  const navigate = useNavigate()
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/home-page')
      else navigate('/sign-in')
    })
  }, [])
  return <p>Loading...</p>
}

function ProtectedLayout({ session }: { session: Session | null }) {
  if (!session) return <Navigate to="/sign-in" replace />
  return <Navigator />
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/sign-in" element={<Signin />} />
        <Route path="/sign-up" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* Protected routes */}
        <Route element={<ProtectedLayout session={session} />}>
          <Route path="/home-page" element={<Homepage />} />
          <Route path="/location-page" element={<Locationpage />} />
          <Route path="/save-page" element={<Savepage />} />
          <Route path="/listbusiness" element={<ListBusiness />} />
        </Route>
        <Route path="/" element={<Navigate to={session ? '/home-page' : '/sign-in'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App