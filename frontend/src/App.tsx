
import Register from './features/auth/pages/Register';
import Signin from './features/auth/pages/Signin';
import Navigator from './features/Navigator';
import Homepage from './features/dashboard/pages/Homepage';
import Locationpage from './features/dashboard/pages/Locationpage';
import Savepage from './features/dashboard/pages/Savepage';
import {createBrowserRouter, RouterProvider,} from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
    {
      index: true,
      path: "/sign-up",
      element: <Register />
    },

    {
      path: "/sign-in",
      element: <Signin />
    },
    {
      path: "/",
      element: <Navigator />,
      children: [
        {
          path: "/home-page",
          element: <Homepage />
        },
        {
          path: "/location-page",
          element: <Locationpage />
        },
        {
          path: "/save-page",
          element: <Savepage />
        },
      ],
    },
  ];

const router = createBrowserRouter(routes);
function App() {
  return (
    <>
      <RouterProvider router = {router} />
    </>
  );
}

export default App