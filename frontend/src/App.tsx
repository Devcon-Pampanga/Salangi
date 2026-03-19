
import Register from './features/auth/components/Register';
import Signin from './features/auth/components/Signin';
import Navigator from './features/Navigator';
import Homepage from './features/dashboard/components/Homepage';
import Locationpage from './features/dashboard/components/Locationpage';
import Savepage from './features/dashboard/components/Savepage';
import {createBrowserRouter, RouterProvider,} from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
    {
      index: true,
      element: <Register />
    },

    {
      path: "/Signin",
      element: <Signin />
    },
    {
      path: "/",
      element: <Navigator />,
      children: [
        {
          path: "/Homepage",
          element: <Homepage />
        },
        {
          path: "/Locationpage",
          element: <Locationpage />
        },
        {
          path: "/Savepage",
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