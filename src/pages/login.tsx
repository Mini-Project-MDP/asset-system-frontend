import { Navigate } from 'react-router'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/shared/context/AuthContext'

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <LoginForm />
}
