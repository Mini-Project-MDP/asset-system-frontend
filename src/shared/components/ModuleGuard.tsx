import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useModuleAccess } from '@/shared/hooks/useModuleAccess'
import { findModule } from '@/shared/navigation/modules'
import AccessDenied from './AccessDenied'

/**
 * Shows a page only to users who may open its module. Typing the address of a
 * module the menu hides does not open it, and the landing page "/" hands users
 * who cannot see the Dashboard over to the first module they can open.
 * The backend enforces the same rules on its endpoints; this is the other half.
 */
export default function ModuleGuard({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { canOpen, landingPath } = useModuleAccess()

  const module = findModule(pathname)
  if (!module || canOpen(module.key)) return <>{children}</>

  if (pathname === '/' && landingPath) return <Navigate to={landingPath} replace />
  return <AccessDenied landingPath={landingPath} />
}
