import { httpClient } from './httpClient'

/** Counters for the sidebar. A key is absent when the user has no access to that module. */
export interface NavigationBadges {
  approvals?: number
  fulfillment?: number
}

export const navigationService = {
  getBadges: async (): Promise<NavigationBadges> => {
    const response = await httpClient.get<NavigationBadges>('/api/v1/navigation/badges')
    return response.data
  },
}
