import { useEffect } from 'react';
import Register from './features/auth/pages/Register';
import Signin from './features/auth/pages/Signin';
import Navigator from './features/Navigator';
import Homepage from './features/dashboard/pages/Homepage';
import Locationpage from './features/dashboard/pages/Locationpage';
import Savepage from './features/dashboard/pages/Savepage';
import ListBusiness from './features/dashboard/components/ListBusiness';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './features/admin/pages/AdminLogin';
import EventsPage from './features/events/pages/EventsPage';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

function AuthHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = session.user;
        const nameParts = (user.user_metadata?.full_name ?? '').split(' ');
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify({
          user_id: user.id,
          first_name: nameParts[0] ?? '',
          last_name: nameParts.slice(1).join(' ') ?? '',
          email: user.email,
          profile_pic: user.user_metadata?.avatar_url ?? null,
        }));
        navigate('/home-page');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const user = session.user;
        const nameParts = (user.user_metadata?.full_name ?? '').split(' ');
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify({
          user_id: user.id,
          first_name: nameParts[0] ?? '',
          last_name: nameParts.slice(1).join(' ') ?? '',
          email: user.email,
          profile_pic: user.user_metadata?.avatar_url ?? null,
        }));
        navigate('/home-page', { replace: true });
      } else {
        navigate('/sign-in', { replace: true });
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-white text-sm">
      Signing you in...
    </div>
  );
}

const routes: RouteObject[] = [
  {
    index: true,
    path: '/sign-up',
    element: (
      <>
        <AuthHandler />
        <Register />
      </>
    ),
  },
  {
    path: '/sign-in',
    element: (
      <>
        <AuthHandler />
        <Signin />
      </>
    ),
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
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
    path: '/',
    element: (
      <ProtectedRoute>
        <Navigator />
      </ProtectedRoute>
    ),
    children: [
      { path: '/home-page', element: <Homepage /> },
      { path: '/location-page', element: <Locationpage /> },
      { path: '/save-page', element: <Savepage /> },
      { path: '/listbusiness', element: <ListBusiness /> },
      { path: '/events-page', element: <EventsPage /> },
    ],
  },
];

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;