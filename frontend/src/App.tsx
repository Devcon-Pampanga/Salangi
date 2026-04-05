import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import type { RouteObject } from 'react-router-dom'

// Auth & Protected Components
import ProtectedRoute from './components/ProtectedRoute'

// Feature Components - Business Side (Standardized to features/business-side)
import Dashboard from './features/business-side/pages/Dashboard'
import Overview from './features/business-side/components/Overview'
import MyBusiness from './features/business-side/components/MyBusiness'
import Events from './features/business-side/components/Events'
import Reviews from './features/business-side/components/Reviews'
import Analytics from './features/business-side/components/Analytics'
import Gallery from './features/business-side/components/Gallery'
import Settings from './features/business-side/components/Settings'
import Notifications from './features/business-side/components/Notifications'

// Feature Components - Main Side
import Navigator from './features/Navigator'
import Homepage from './features/dashboard/pages/Homepage'
import Locationpage from './features/dashboard/pages/Locationpage'
import Savepage from './features/dashboard/pages/Savepage'
import MapView from './map/MapView'
import Signin from './features/auth/pages/Signin'
import Register from './features/auth/pages/Register'
import BusinessRegister from './features/auth/pages/BusinessRegister'
import BusinessSignin from './features/auth/pages/BusinessSignin'
import HeroListBusiness from './features/dashboard/pages/HeroListBusiness'
import ListBusiness from './BusinessSide/components/ListBusiness'

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

const routes = (session: Session | null): RouteObject[] => [
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/sign-in',
    element: session ? <Navigate to="/home-page" replace /> : <Signin />,
  },
  {
    path: '/sign-up',
    element: session ? <Navigate to="/home-page" replace /> : <Register />,
  },
  {
    path: '/admin',
    element: <AdminLogin />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
  },

  { 
    path: '/listyourbusiness', 
    element: (
      <ProtectedRoute>
        <HeroListBusiness />
      </ProtectedRoute>
    ) 
  },

  { 
    path: '/businessRegister', 
    element: (
      <ProtectedRoute>
        <BusinessRegister />
      </ProtectedRoute>
    ) 
  },

  { 
    path: '/businessSignin', 
    element: (
      <ProtectedRoute>
        <BusinessSignin />
      </ProtectedRoute>
    ) 
  },

  { 
    path: '/listbusiness', 
    element: (
      <ProtectedRoute>
        <ListBusiness />
      </ProtectedRoute>
    ) 
  },

  // Business Side Dashboard
  { 
    path: '/dashboard', 
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="overview" replace /> },
      { path: 'overview', element: <Overview /> },
      { path: 'mybusiness', element: <MyBusiness /> },
      { path: 'events', element: <Events /> },
      { path: 'reviews', element: <Reviews /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'settings', element: <Settings /> },
      { path: 'notifications', element: <Notifications /> }
    ]
  },

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Navigator />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/home-page" replace /> },
      { path: 'home-page', element: <Homepage /> },
      { path: 'location-page', element: <Locationpage /> },
      { path: 'save-page', element: <Savepage /> },
      { path: 'map-page', element: <MapView /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
];

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

  if (loading) return <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">Loading...</div>

  const router = createBrowserRouter(routes(session));
  return <RouterProvider router={router} />;
}

export default App;