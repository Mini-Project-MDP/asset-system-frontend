import { httpClient } from '@/shared/services/httpClient'
import { CATEGORY_HIERARCHY, ROLE_LABELS } from '@/features/requests/services/requestService'
import type {
  OutletItem,
  OutletInput,
  DistributorItem,
  DistributorInput,
  AssetTypeItem,
  AssetTypeInput,
} from '../types'

/** `include_inactive` is only sent when set, so the default list stays active-only. */
const listParams = (includeInactive: boolean) =>
  includeInactive ? { include_inactive: true } : undefined

export const settingsService = {
  // Outlets
  getOutlets: async (includeInactive = false): Promise<OutletItem[]> => {
    const res = await httpClient.get<OutletItem[]>('/api/v1/settings/outlets', {
      params: listParams(includeInactive),
    })
    return res.data
  },
  addOutlet: async (outlet: OutletInput): Promise<OutletItem> => {
    const res = await httpClient.post<OutletItem>('/api/v1/settings/outlets', outlet)
    return res.data
  },
  updateOutlet: async (id: string, outlet: OutletInput): Promise<OutletItem> => {
    const res = await httpClient.put<OutletItem>(`/api/v1/settings/outlets/${id}`, outlet)
    return res.data
  },

  // Distributors
  getDistributors: async (includeInactive = false): Promise<DistributorItem[]> => {
    const res = await httpClient.get<DistributorItem[]>('/api/v1/settings/distributors', {
      params: listParams(includeInactive),
    })
    return res.data
  },
  addDistributor: async (dist: DistributorInput): Promise<DistributorItem> => {
    const res = await httpClient.post<DistributorItem>('/api/v1/settings/distributors', dist)
    return res.data
  },
  updateDistributor: async (id: string, dist: DistributorInput): Promise<DistributorItem> => {
    const res = await httpClient.put<DistributorItem>(`/api/v1/settings/distributors/${id}`, dist)
    return res.data
  },

  // Types
  getTypes: async (includeInactive = false): Promise<AssetTypeItem[]> => {
    const res = await httpClient.get<AssetTypeItem[]>('/api/v1/settings/types', {
      params: listParams(includeInactive),
    })
    return res.data
  },
  addType: async (type: AssetTypeInput): Promise<AssetTypeItem> => {
    const res = await httpClient.post<AssetTypeItem>('/api/v1/settings/types', type)
    return res.data
  },
  updateType: async (id: string, type: AssetTypeInput): Promise<AssetTypeItem> => {
    const res = await httpClient.put<AssetTypeItem>(`/api/v1/settings/types/${id}`, type)
    return res.data
  },

  // Flow
  getFlow: async () => {
    return {
      hierarchy: CATEGORY_HIERARCHY,
      roleLabels: ROLE_LABELS,
    }
  },
}
