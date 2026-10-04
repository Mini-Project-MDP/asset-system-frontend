import NewRequestForm from '@/features/requests/components/NewRequestForm'
import AccessDenied from '@/shared/components/AccessDenied'
import { useAuth } from '@/shared/context/AuthContext'

export default function NewRequestPage() {
  const { hasPermission } = useAuth()

  // Creating a request is a separate right from reading the list (Admin, Asset Team, Sales Admin).
  if (!hasPermission('request:create')) return <AccessDenied landingPath="/requests" />

  return <NewRequestForm />
}
