import { httpClient } from '@/shared/services/httpClient'
import type { RequestDetailItem } from '@/features/requests/types'
import { requestService, FULFILL_STAGES } from '@/features/requests/services/requestService'
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
    try {
      const response = await httpClient.get<FulfillmentOverview>('/api/fulfillment', {
        params: filter,
      })
      return response.data
    } catch {
      const allRequests = await requestService.getRequests()
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

      // Pending fulfillment: step >= chain.length AND fulfillStep < FULFILL_STAGES.length
      const pending = filtered.filter(
        (r) => r.step >= 0 && r.step >= r.chain.length && r.fulfillStep != null && r.fulfillStep >= 0 && r.fulfillStep < FULFILL_STAGES.length
      )

      // Completed fulfillment: step >= chain.length AND fulfillStep >= FULFILL_STAGES.length
      const history = filtered.filter(
        (r) => r.step >= 0 && r.step >= r.chain.length && r.fulfillStep != null && r.fulfillStep >= FULFILL_STAGES.length
      )

      return { pending, history }
    }
  },

  getFulfillmentDetail: async (id: string): Promise<RequestDetailItem | undefined> => {
    try {
      const response = await httpClient.get<RequestDetailItem>(`/api/fulfillment/${id}`)
      return response.data
    } catch {
      return requestService.getRequestById(id)
    }
  },

  saveFulfillmentData: async (id: string, fulfillData: unknown): Promise<RequestDetailItem> => {
    try {
      const response = await httpClient.post<RequestDetailItem>(
        `/api/fulfillment/${id}/data`,
        { fulfillData }
      )
      return response.data
    } catch {
      const req = await requestService.getRequestById(id)
      if (!req) throw new Error('Request not found')

      req.fulfillData = fulfillData
      req.fulfillStep = 1 // Advance to 'Shipped'
      req.statusTag = { cls: 'brand', text: `Fulfillment — ${FULFILL_STAGES[1]}` }

      return { ...req }
    }
  },

  advanceStage: async (id: string): Promise<RequestDetailItem> => {
    try {
      const response = await httpClient.post<RequestDetailItem>(`/api/fulfillment/${id}/advance`)
      return response.data
    } catch {
      const req = await requestService.getRequestById(id)
      if (!req) throw new Error('Request not found')

      const currentStep = req.fulfillStep != null ? req.fulfillStep : 0
      const nextStep = currentStep + 1
      req.fulfillStep = nextStep

      if (nextStep >= FULFILL_STAGES.length) {
        req.statusTag = { cls: 'go', text: 'Completed' }
      } else {
        req.statusTag = { cls: 'brand', text: `Fulfillment — ${FULFILL_STAGES[nextStep]}` }
      }

      return { ...req }
    }
  },
}
