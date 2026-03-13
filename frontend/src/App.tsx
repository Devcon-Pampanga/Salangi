import Register from './features/components/Register';
import Signin from './features/components/Signin';
import {createBrowserRouter, RouterProvider,} from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
    {
      path: "/",
      element: <Register />
    },

    {
      path: "/Signin",
      element: <Signin />
    }
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
