import { httpClient } from '@/shared/services/httpClient'
import { MANUAL_DISTRIBUTOR } from '../types'
import type {
  RequestDetailItem,
  RequestFilter,
  RequestFormOptions,
  CreateRequestFormInput,
  CategoryType,
} from '../types'

export const ROLE_LABELS: Record<string, string> = {
  SA: 'Sales Admin',
  SS: 'Sales Supervisor',
  RSM: 'Regional Sales Manager',
  GRSM: 'Group Regional Sales Manager',
  NSM: 'National Sales Manager',
  SD: 'Sales Director',
  Cabang: 'Cabang / Distributor',
}

export const CATEGORY_HIERARCHY: Record<CategoryType, string[]> = {
  Barcode: ['SA', 'SS', 'RSM', 'GRSM', 'NSM', 'SD'],
  Android: ['Cabang', 'GRSM', 'NSM', 'SD'],
  Server: ['Cabang', 'GRSM', 'NSM', 'SD'],
  // Until the business fixes it, Mobile Printer follows Server.
  'Mobile Printer': ['Cabang', 'GRSM', 'NSM', 'SD'],
}

export const FULFILL_STAGES = ['Processing', 'Shipped', 'Delivered']

const CREATE_REQUEST_TIMEOUT_MS = 30_000

export function computeChain(category: CategoryType, requesterRole: string): string[] {
  const levels = CATEGORY_HIERARCHY[category] || []
  const idx = levels.indexOf(requesterRole)
  return idx === -1 ? [...levels] : levels.slice(idx + 1)
}

export const requestService = {
  getRequests: async (filters: RequestFilter = {}): Promise<RequestDetailItem[]> => {
    const response = await httpClient.get<RequestDetailItem[]>('/api/v1/requests', {
      params: filters,
    })
    return response.data
  },

  getRequestById: async (id: string): Promise<RequestDetailItem | undefined> => {
    try {
      const response = await httpClient.get<RequestDetailItem>(`/api/v1/requests/${id}`)
      return response.data
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number } }
      if (errorObj?.response?.status === 404) {
        return undefined
      }
      throw err
    }
  },

  getFormOptions: async (): Promise<RequestFormOptions> => {
    const response = await httpClient.get<RequestFormOptions>('/api/v1/requests/form-options')
    return response.data
  },

  createRequest: async (input: CreateRequestFormInput): Promise<RequestDetailItem> => {
    // A distributor from master data is sent by name; one typed in by hand is sent as
    // its own field, never as a made-up master data name.
    const isManual = input.distributor === MANUAL_DISTRIBUTOR
    const payload = {
      ...input,
      distributor: isManual ? '' : input.distributor,
      distributorManual: isManual ? (input.distributorManual ?? '').trim() : '',
      // Only a Barcode request is counted by reason; nothing is sent for the others.
      breakdown: input.category === 'Barcode' ? (input.breakdown ?? []).filter((b) => b.qty > 0) : [],
      revisedFromId: input.revisedFromId || undefined,
    }

    // Creating a request also registers it with the Approval Engine (the backend allows
    // that call up to 15s), so the default 10s timeout can give up on a request the
    // server goes on to save, telling the user it failed.
    const response = await httpClient.post<RequestDetailItem>('/api/v1/requests', payload, {
      timeout: CREATE_REQUEST_TIMEOUT_MS,
    })
    return response.data
  },
}
