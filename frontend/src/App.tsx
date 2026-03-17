import Savepage from './features/components/Savepage';
import Navigator from './features/components/Navigator';
import {createBrowserRouter, RouterProvider,} from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
    {
      path: "/",
      element: <Navigator />,
      children: [
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