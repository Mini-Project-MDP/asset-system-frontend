import { Outlet, useLocation } from 'react-router'
import MainLayout from '@/shared/layouts/MainLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import ModuleGuard from '@/shared/components/ModuleGuard'

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
        <ModuleGuard>
          <Outlet />
        </ModuleGuard>
      </MainLayout>
    </ProtectedRoute>
  )
}
