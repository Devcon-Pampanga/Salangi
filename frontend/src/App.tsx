import BusinessRegister from './features/auth/pages/BusinessRegister'
import BusinessSignin from './features/auth/pages/BusinessSignin'
import Dashboard from './features/business-side/pages/Dashboard'
import Overview from './features/business-side/components/Overview'
import MyBusiness from './features/business-side/components/MyBusiness'
import Events from './features/business-side/components/Events'
import Reviews from './features/business-side/components/Reviews'
import Navigator from './features/Navigator';
import Homepage from './features/dashboard/pages/Homepage';
import Locationpage from './features/dashboard/pages/Locationpage';
import Savepage from './features/dashboard/pages/Savepage';
import ListBusiness from './features/business-side/components/ListBusiness';
import MapView from './map/MapView';
import ProtectedRoute from './routes/ProtectedRoute';
import HeroListBusiness from './features/dashboard/pages/HeroListBusiness'
import AdminLogin from './features/admin/pages/AdminLogin';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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
    element: <HeroListBusiness />
  },

  { 
    path: '/businessRegister', 
    element: <BusinessRegister />
  },

  { 
    path: '/businessSignin', 
    element: <BusinessSignin />
  },

  { 
    path: '/listbusiness', 
    element: <ListBusiness />
  },

  // Eto yung sa Business Side
  { 
    path: '/dashboard', 
    element: <Dashboard />,
    
    children: [
      {path: 'overview', element: <Overview />},
      {path: 'mybusiness', element: <MyBusiness />},
      {path: 'events', element: <Events />},
      {path: 'reviews', element: <Reviews />}
    ]
  },

  {
    path: '/',

    // REMOVE PROTECTED ROUTE
    element: <Navigator />,
    children: [
      { index: true, element: <Navigate to="/home-page" replace /> },
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