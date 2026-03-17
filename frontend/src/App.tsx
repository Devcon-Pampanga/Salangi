import Register from './features/auth/components/Register';
import Signin from './features/auth/components/Signin';
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
