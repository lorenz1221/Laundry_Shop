/**
 * Routes — Application routing configuration
 * Note: Currently using simple conditional rendering in App.tsx
 * This file is prepared for React Router integration if needed
 */

// To use React Router, install it first: pnpm add react-router-dom
// import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { PATHS } from './path';

// Route configuration object for future use with React Router
export const routeConfig = [
  {
    path: PATHS.HOME,
    name: 'Home',
  },
  {
    path: PATHS.LOGIN,
    name: 'Login',
  },
  {
    path: PATHS.REGISTER,
    name: 'Register',
  },
  {
    path: PATHS.CUSTOMER.DASHBOARD,
    name: 'Customer Dashboard',
  },
  {
    path: PATHS.STAFF.DASHBOARD,
    name: 'Staff Dashboard',
  },
];

export { PATHS };
