import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// -- Rotas Normais
import App from './App.tsx'
import Login from './Login.tsx'
import CadCliente from './CadCliente.tsx'

// -- Rotas Admin
import AdminLayout from './admin/AdminLayout.tsx'
import AdminDashboard from './admin/AdminDashboard.tsx'
import AdminLogin from './admin/AdminLogin.tsx'

import { Layout } from './Layout.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const rotas = createBrowserRouter([
  {
    path: '/admin/login',
    element: <AdminLogin />
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> }
    ]
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: '/login', element: <Login /> },
      { path: '/cadastro', element: <CadCliente /> }
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>,
)
