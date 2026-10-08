import { httpClient } from '@/shared/services/httpClient'
import type { RequestDetailItem } from '@/features/requests/types'
import { FULFILL_STAGES } from '@/features/requests/services/requestService'
import type { FulfillmentFilter, FulfillmentOverview, ImeiInfo, PhoneBrand } from '../types'

// Saving and advancing write the stage and its history, then read the request back:
// several database round trips, which can outlast the default 10s timeout. When the
// browser gives up first, the server still applies the step.
const FULFILLMENT_ACTION_TIMEOUT_MS = 30_000

/**
 * Identifies a device from its IMEI. Resolves to null when the device is not in
 * the reference table (the form then falls back to manual input); rejects when
 * the value is not a plausible IMEI or the request fails.
 */
export async function lookupImei(imei: string): Promise<ImeiInfo | null> {
  const response = await httpClient.get<{ found: boolean } & Partial<ImeiInfo>>(
    `/api/v1/fulfillment/imei-lookup/${encodeURIComponent(imei.trim())}`
  )
  const { found, brand, model, releaseYear } = response.data
  return found && brand && model && releaseYear ? { brand, model, releaseYear } : null
}

export const fulfillmentService = {
  getPhoneCatalog: async (): Promise<PhoneBrand[]> => {
    const response = await httpClient.get<PhoneBrand[]>('/api/v1/fulfillment/phone-catalog')
    return response.data
  },

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
      { fulfillData },
      { timeout: FULFILLMENT_ACTION_TIMEOUT_MS }
    )
    return response.data
  },

  advanceStage: async (id: string): Promise<RequestDetailItem> => {
    const response = await httpClient.post<RequestDetailItem>(`/api/v1/fulfillment/${id}/advance`, undefined, {
      timeout: FULFILLMENT_ACTION_TIMEOUT_MS,
    })
    return response.data
  },
}
