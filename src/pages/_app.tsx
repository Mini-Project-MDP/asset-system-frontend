import { Outlet, useLocation } from 'react-router'
import MainLayout from '@/shared/layouts/MainLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

export default function App() {
  const location = useLocation()

  const isPublicRoute =
    location.pathname === '/login' || location.pathname.startsWith('/sso/callback')

  if (isPublicRoute) {
    return <Outlet />
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </ProtectedRoute>
  )
}
