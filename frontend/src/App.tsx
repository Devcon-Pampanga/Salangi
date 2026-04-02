import BusinessRegister from './features/auth/pages/BusinessRegister'
import BusinessSignin from './features/auth/pages/BusinessSignin'
import Dashboard from './BusinessSide/pages/Dashboard'
import Overview from './BusinessSide/components/Overview'
import MyBusiness from './BusinessSide/components/MyBusiness'
import Events from './BusinessSide/components/Events'
import Reviews from './BusinessSide/components/Reviews'
import Navigator from './features/Navigator';
import Homepage from './features/dashboard/pages/Homepage';
import Locationpage from './features/dashboard/pages/Locationpage';
import Savepage from './features/dashboard/pages/Savepage';
import ListBusiness from './BusinessSide/components/ListBusiness';
import MapView from './map/MapView';
import ProtectedRoute from './components/ProtectedRoute';
import HeroListBusiness from './features/dashboard/pages/HeroListBusiness'
import AdminLogin from './features/admin/pages/AdminLogin';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
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

  // Eto yung sa Business Side
  { 
    path: '/dashboard', 
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    
    children: [
      {path: 'overview', element: <Overview />},
      {path: 'mybusiness', element: <MyBusiness />},
      {path: 'events', element: <Events />},
      {path: 'reviews', element: <Reviews />}
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
      { path: '/home-page', element: <Homepage /> },
      { path: '/location-page', element: <Locationpage /> },
      { path: '/save-page', element: <Savepage /> },
      { path: '/map-page', element: <MapView /> },
    ],
  },
];

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;