import BusinessRegister from './features/auth/pages/BusinessRegister'
import BusinessSignin from './features/auth/pages/BusinessSignin'
import Dashboard from './features/business-side/pages/Dashboard'
import Overview from './features/business-side/components/Overview'
import MyBusiness from './features/business-side/components/MyBusiness'
import Events from './features/business-side/components/Events'
import Reviews from './features/business-side/components/Reviews'
import Analytics from './features/business-side/components/Analytics'
import Gallery from './features/business-side/components/Gallery'
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
import { ROUTES } from './routes/paths';

const routes: RouteObject[] = [
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

  // Eto yung sa Business Side
  { 
    path: ROUTES.DASHBOARD, 
    element: <Dashboard />,
    
    children: [
      {path: ROUTES.DASHBOARD_REL.OVERVIEW, element: <Overview />},
      {path: ROUTES.DASHBOARD_REL.MY_BUSINESS, element: <MyBusiness />},
      {path: ROUTES.DASHBOARD_REL.EVENTS, element: <Events />},
      {path: ROUTES.DASHBOARD_REL.REVIEWS, element: <Reviews />},
      {path: ROUTES.DASHBOARD_REL.ANALYTICS, element: <Analytics />},
      {path: ROUTES.DASHBOARD_REL.GALLERY, element: <Gallery />}
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
];

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;