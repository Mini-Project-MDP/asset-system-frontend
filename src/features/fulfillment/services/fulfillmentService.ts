import { httpClient } from '@/shared/services/httpClient'
import type { RequestDetailItem } from '@/features/requests/types'
import { FULFILL_STAGES } from '@/features/requests/services/requestService'
import type { FulfillmentFilter, FulfillmentOverview } from '../types'

export const PHONE_BRANDS = ['Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme']
export const PHONE_MODELS = ['A-series', 'Galaxy Tab', 'Redmi Note', 'Standard', 'Enterprise']

export const LOOKUP_IMEIS: Record<string, { brand: string; model: string; releaseYear: string }> = {
  '354892019283741': { brand: 'Samsung', model: 'Galaxy Tab', releaseYear: '2023' },
  '864920192837412': { brand: 'Xiaomi', model: 'Redmi Note', releaseYear: '2022' },
  '358291029384756': { brand: 'Oppo', model: 'A-series', releaseYear: '2024' },
}

export function lookupImei(imei: string) {
  return LOOKUP_IMEIS[imei.trim()] || null
}

export const fulfillmentService = {
  getFulfillmentItems: async (filter: FulfillmentFilter = {}): Promise<FulfillmentOverview> => {
    const response = await httpClient.get<RequestDetailItem[]>('/api/v1/fulfillment', {
      params: filter,
    })
    const allRequests = response.data || []
    const q = filter.q?.toLowerCase() || ''
    const typeFilter = filter.type || 'All types'

    const filtered = allRequests.filter((r) => {
      const matchesQ =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.outlet.toLowerCase().includes(q) ||
        r.by.toLowerCase().includes(q)
      const matchesType = typeFilter === 'All types' || r.type === typeFilter
      return matchesQ && matchesType
    })

    const pending = filtered.filter(
      (r) => r.statusTag?.text.startsWith('Fulfillment') || (r.fulfillStep != null && r.fulfillStep < FULFILL_STAGES.length && r.statusTag?.cls === 'brand')
    )

    const history = filtered.filter(
      (r) => r.statusTag?.text === 'Completed' || (r.fulfillStep != null && r.fulfillStep >= FULFILL_STAGES.length)
    )

    return { pending, history }
  },

  getFulfillmentDetail: async (id: string): Promise<RequestDetailItem | undefined> => {
    try {
      const response = await httpClient.get<RequestDetailItem>(`/api/v1/fulfillment/${id}`)
      return response.data
    } catch (err: any) {
      if (err?.response?.status === 404) return undefined
      throw err
    }
  },

  saveFulfillmentData: async (id: string, fulfillData: unknown): Promise<RequestDetailItem> => {
    const response = await httpClient.post<RequestDetailItem>(
      `/api/v1/fulfillment/${id}/data`,
      { fulfillData }
    )
    return response.data
  },

  advanceStage: async (id: string): Promise<RequestDetailItem> => {
    const response = await httpClient.post<RequestDetailItem>(`/api/v1/fulfillment/${id}/advance`)
    return response.data
  },
}
