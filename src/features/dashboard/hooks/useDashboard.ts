import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

export const useGetDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: dashboardService.getOverview,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
