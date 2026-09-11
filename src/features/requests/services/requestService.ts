import { httpClient } from '@/shared/services/httpClient'
import type {
  RequestDetailItem,
  RequestFilter,
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
}

export const REQUESTER_ROLES_BY_CATEGORY: Record<CategoryType, string[]> = {
  Barcode: ['SA', 'SS', 'RSM', 'GRSM', 'NSM', 'SD'],
  Android: ['Cabang', 'SD'],
  Server: ['Cabang', 'SD'],
}

export const DISTRIBUTORS = [
  'PT Distributor Utama',
  'PT Karya Selaras',
  'PT Mitra Jaya Abadi',
  'CV Sumber Makmur',
]

export const DISTRIBUTOR_OUTLETS: Record<string, string[]> = {
  'PT Distributor Utama': ['Bandung Kota', 'Depok Tengah'],
  'PT Karya Selaras': ['Surabaya Timur', 'Bekasi Utara'],
  'PT Mitra Jaya Abadi': ['Medan Kota'],
  'CV Sumber Makmur': ['Cirebon Kota'],
}

export const SALES_DIVISIONS = ['M1 BIS', 'M1 CWC', 'M245', 'M3']
export const REQ_TYPES = ['Baru', 'Peremajaan']
export const FULFILL_STAGES = ['Processing', 'Shipped', 'Delivered']

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

  createRequest: async (input: CreateRequestFormInput): Promise<RequestDetailItem> => {
    const distributorName =
      input.distributor === '__other__' ? input.distributorManual || 'Manual Distributor' : input.distributor

    const payload = {
      ...input,
      distributor: distributorName,
      revisedFromId: input.revisedFromId || undefined,
    }

    const response = await httpClient.post<RequestDetailItem>('/api/v1/requests', payload)
    return response.data
  },
}
