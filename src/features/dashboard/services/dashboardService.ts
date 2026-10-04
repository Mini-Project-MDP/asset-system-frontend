import { httpClient } from '@/shared/services/httpClient'
import type { DashboardOverviewResponse } from '../types'

export const dashboardService = {
  getOverview: async (year?: number): Promise<DashboardOverviewResponse> => {
    const response = await httpClient.get<DashboardOverviewResponse>('/api/v1/dashboard/overview', {
      params: year ? { year } : undefined,
    })
    return response.data
  },
}
