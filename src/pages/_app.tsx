import { Outlet, useLocation } from 'react-router'
import MainLayout from '@/shared/layouts/MainLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'

export default function App() {
  const location = useLocation()

  if (location.pathname === '/login') {
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
