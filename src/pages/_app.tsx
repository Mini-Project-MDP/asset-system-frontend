import { Outlet } from 'react-router'
import MainLayout from '@/shared/layouts/MainLayout'

export default function App() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
