import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

/** year: the chart year; leave undefined for the current year. */
export const useGetDashboardOverview = (year?: number) => {
  return useQuery({
    queryKey: ['dashboard', 'overview', year ?? 'current'],
    queryFn: () => dashboardService.getOverview(year),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    // Keep the old chart on screen while another year loads, instead of flashing a spinner.
    placeholderData: keepPreviousData,
  })
}
