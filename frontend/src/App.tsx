import Register from './features/auth/components/Register';
import Signin from './features/auth/components/Signin';
import Navigator from './features/dashboard/components/Navigator';
import Homepage from './features/dashboard/components/Homepage';
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
