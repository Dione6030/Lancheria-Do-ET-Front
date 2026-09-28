import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// -- Rotas Normais
import App from './App.tsx'
import Login from './Login.tsx'
import CadCliente from './CadCliente.tsx'
import CadUser from './CadUser.tsx'

// -- Rotas Admin
import AdminLayout from './admin/AdminLayout.tsx'
import AdminDashboard from './admin/AdminDashboard.tsx'
import NovoLanche from './admin/NovoLanche.tsx'

import { Layout } from './Layout.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const rotas = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'novo-lanche', element: <NovoLanche /> }
    ]
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: '/login', element: <Login /> },
      { path: '/cadastro-cliente', element: <CadCliente /> },
      { path: '/cadastro-user', element: <CadUser /> }
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>,
)
