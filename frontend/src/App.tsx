import Navigator from './features/components/Navigator';
import Homepage from './features/components/Homepage';
import {createBrowserRouter, RouterProvider,} from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
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
