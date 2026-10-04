import { useQuery } from '@tanstack/react-query'
import { navigationService } from '@/shared/services/navigationService'

export const NAVIGATION_BADGES_KEY = ['navigation', 'badges'] as const

/** Sidebar counters, refreshed every minute and whenever an action changes them. */
export function useNavigationBadges(enabled: boolean) {
  return useQuery({
    queryKey: NAVIGATION_BADGES_KEY,
    queryFn: navigationService.getBadges,
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}
