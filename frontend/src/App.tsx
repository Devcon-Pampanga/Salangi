import Navigator from './features/components/Navigator';
import Homepage from './features/components/Homepage';
import ListBusiness from './features/components/Listbusiness'
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

        {
        path: "/listbusiness",
        element: <ListBusiness />
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
