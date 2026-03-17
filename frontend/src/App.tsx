import Navigator from './features/components/Navigator';
import Locationpage from './features/components/Locationpage';
import {createBrowserRouter, RouterProvider,} from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
    {
      path: "/",
      element: <Navigator />,
      children: [
        {
          path: "/Locationpage",
          element: <Locationpage />
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