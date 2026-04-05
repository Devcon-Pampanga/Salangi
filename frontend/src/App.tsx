import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import type { RouteObject } from 'react-router-dom'
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

import Register from './features/auth/pages/Register'
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

const routes = (session: Session | null): RouteObject[] => [
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/sign-up',
    element: session ? <Navigate to="/home-page" replace /> : <Register />,
  },
  {
    path: ROUTES.ADMIN,
    element: <AdminLogin />,
  },
  {
    path: ROUTES.ADMIN_DASHBOARD,
    element: <AdminDashboard />,
  },

  { 
    path: ROUTES.LIST_YOUR_BUSINESS, 
    element: <HeroListBusiness />
  },

  { 
    path: ROUTES.BUSINESS_REGISTER, 
    element: <BusinessRegister />
  },

  { 
    path: ROUTES.BUSINESS_SIGNIN, 
    element: <BusinessSignin />
  },

  { 
    path: ROUTES.LIST_BUSINESS, 
    element: <ListBusiness />
  },

  // Business Side Dashboard
  { 
    path: ROUTES.DASHBOARD, 
    element: <Dashboard />,
    
    children: [
      {path: ROUTES.DASHBOARD_REL.OVERVIEW, element: <Overview />},
      {path: ROUTES.DASHBOARD_REL.MY_BUSINESS, element: <MyBusiness />},
      {path: ROUTES.DASHBOARD_REL.EVENTS, element: <Events />},
      {path: ROUTES.DASHBOARD_REL.REVIEWS, element: <Reviews />},
      {path: ROUTES.DASHBOARD_REL.ANALYTICS, element: <Analytics />},
      {path: ROUTES.DASHBOARD_REL.GALLERY, element: <Gallery />},
      {path: ROUTES.DASHBOARD_REL.SETTINGS, element: <Settings />}
    ]
  },

  {
    path: '/',

    // REMOVE PROTECTED ROUTE
    element: <Navigator />,
    children: [
      { index: true, element: <Navigate to={ROUTES.HOME} replace /> },
      { path: ROUTES.HOME, element: <Homepage /> },
      { path: ROUTES.LOCATION, element: <Locationpage /> },
      { path: ROUTES.SAVE, element: <Savepage /> },
      { path: ROUTES.MAP, element: <MapView /> },
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