import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import NavbarProtector from './Components/Navbar/Navbar.tsx';
import Login from './Pages/Login/Login.index.tsx';
import Logout from './Pages/Logout/Logout.index.tsx';
import Dashboard from './Pages/Dashboard/Dashboard.index.tsx';
import Maintenance from './Pages/Maintenance/Maintenance.index.tsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <NavbarProtector selectedMenu='Dashboard'><Dashboard /></NavbarProtector>,
  },
  {
    path: "/maintenance",
    element: <NavbarProtector selectedMenu='Maintenance'><Maintenance /></NavbarProtector>,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
  {
    path: "/*",
    element: <NavbarProtector selectedMenu='NotFound'><h1>Not found</h1></NavbarProtector>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
