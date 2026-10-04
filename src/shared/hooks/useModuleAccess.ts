import { useAuth } from '@/shared/context/AuthContext'
import { APP_MODULES, type ModuleKey } from '@/shared/navigation/modules'

/** The modules the signed-in user may open, and the first of them (the landing page). */
export function useModuleAccess() {
  const { hasPermission } = useAuth()
  const allowed = APP_MODULES.filter((m) => m.isAllowed(hasPermission))
  return {
    allowed,
    canOpen: (key: ModuleKey) => allowed.some((m) => m.key === key),
    landingPath: allowed[0]?.path,
  }
}
