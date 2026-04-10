import { createBrowserRouter } from 'react-router-dom';
import DefaultLayout from '../layouts/DefaultLayout';
import Assignments from '../pages/assignment';
import Shipments from '../pages/shipment';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      {
        path: '/assignment',
        element: <Assignments />,
      },
      {
        path: '/shipment',
        element: <Shipments />,
      },
    ],
  },
]);

export default router;
