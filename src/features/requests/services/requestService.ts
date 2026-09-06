import { httpClient } from '@/shared/services/httpClient'
import type {
  RequestDetailItem,
  RequestFilter,
  CreateRequestFormInput,
  CategoryType,
  ApprovalChainStep,
  HistoryItem,
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

interface RawRequestConfig {
  id: string
  outlet: string
  category: CategoryType
  qty: number
  pri: 'normal' | 'high' | 'urgent'
  distributor: string
  salesDivision: string
  requesterRole: string
  requesterName: string
  reqType?: string
  date: string
  step: number
  fulfillStep?: number
  fulfillData?: any
}

function buildRequestItem(o: RawRequestConfig): RequestDetailItem {
  const chainRoles = computeChain(o.category, o.requesterRole)
  const step = o.step != null ? o.step : 0

  const chain: ApprovalChainStep[] = chainRoles.map((role, i) => {
    let status: ApprovalChainStep['status'] = 'pending'
    if (step === -1) {
      if (i === 0) status = 'approved'
      else if (i === 1) status = 'revision'
    } else if (step === -2) {
      if (i === 0) status = 'approved'
      else if (i === 1) status = 'rejected'
    } else {
      if (i < step) status = 'approved'
      else if (i === step) status = 'current'
    }
    return { role, roleLabel: ROLE_LABELS[role] || role, status }
  })

  const hist: HistoryItem[] = [
    {
      role: ROLE_LABELS[o.requesterRole] || o.requesterRole,
      action: 'Submitted',
      date: o.date,
      type: 'go',
    },
  ]

  chain.forEach((n) => {
    if (n.status === 'approved')
      hist.push({ role: n.roleLabel, action: 'Approved', date: o.date, type: 'go' })
    else if (n.status === 'revision')
      hist.push({ role: n.roleLabel, action: 'Requested revision', date: o.date, type: 'warn' })
    else if (n.status === 'rejected')
      hist.push({ role: n.roleLabel, action: 'Rejected', date: o.date, type: 'stop' })
  })

  const fulfillStep = o.fulfillStep != null ? o.fulfillStep : -1
  let statusTag: RequestDetailItem['statusTag']

  if (step === -1) {
    statusTag = { cls: 'warn', text: `Revision — ${chainRoles[1] ? ROLE_LABELS[chainRoles[1]] || chainRoles[1] : ''}` }
  } else if (step === -2) {
    statusTag = { cls: 'stop', text: 'Rejected' }
  } else if (step >= chain.length) {
    statusTag =
      fulfillStep >= FULFILL_STAGES.length
        ? { cls: 'go', text: 'Completed' }
        : { cls: 'brand', text: `Fulfillment — ${FULFILL_STAGES[Math.max(0, fulfillStep)]}` }
  } else {
    statusTag = { cls: 'warn', text: `Waiting — ${ROLE_LABELS[chainRoles[step]] || chainRoles[step]}` }
  }

  return {
    id: o.id,
    outlet: o.outlet,
    type: o.category,
    qty: o.qty,
    pri: o.pri,
    distributor: o.distributor,
    salesDivision: o.salesDivision,
    reqType: o.reqType || null,
    by: o.requesterName,
    byRole: o.requesterRole,
    date: o.date,
    step,
    chain,
    hist,
    statusTag,
    fulfillStep: o.fulfillStep,
    fulfillData: o.fulfillData,
  }
}

// Initial Mock Dataset matching prototype index.html
let INITIAL_REQUESTS: RequestDetailItem[] = [
  buildRequestItem({
    id: 'REQ-2093',
    outlet: 'Cirebon Kota',
    category: 'Barcode',
    qty: 6,
    pri: 'high',
    distributor: 'CV Sumber Makmur',
    salesDivision: 'M1 BIS',
    requesterRole: 'SA',
    requesterName: 'Laras P.',
    date: '12 Jul 2026',
    step: 0,
  }),
  buildRequestItem({
    id: 'REQ-2091',
    outlet: 'Bandung Kota',
    category: 'Barcode',
    qty: 4,
    pri: 'high',
    distributor: 'PT Distributor Utama',
    salesDivision: 'M1 CWC',
    requesterRole: 'SS',
    requesterName: 'Dimas W.',
    date: '12 Jul 2026',
    step: 0,
  }),
  buildRequestItem({
    id: 'REQ-2089',
    outlet: 'Depok Tengah',
    category: 'Barcode',
    qty: 5,
    pri: 'normal',
    distributor: 'PT Distributor Utama',
    salesDivision: 'M1 BIS',
    requesterRole: 'RSM',
    requesterName: 'Eka P.',
    date: '11 Jul 2026',
    step: 0,
  }),
  buildRequestItem({
    id: 'REQ-2090',
    outlet: 'Cirebon Kota',
    category: 'Server',
    qty: 6,
    pri: 'high',
    distributor: 'CV Sumber Makmur',
    salesDivision: 'M3',
    requesterRole: 'Cabang',
    requesterName: 'Fajar S.',
    date: '12 Jul 2026',
    step: 0,
  }),
  buildRequestItem({
    id: 'REQ-2088',
    outlet: 'Surabaya Timur',
    category: 'Android',
    qty: 8,
    pri: 'normal',
    distributor: 'PT Karya Selaras',
    salesDivision: 'M245',
    requesterRole: 'Cabang',
    requesterName: 'Rani S.',
    reqType: 'Baru',
    date: '11 Jul 2026',
    step: 1,
  }),
  buildRequestItem({
    id: 'REQ-2086',
    outlet: 'Bekasi Utara',
    category: 'Android',
    qty: 5,
    pri: 'normal',
    distributor: 'PT Karya Selaras',
    salesDivision: 'M245',
    requesterRole: 'Cabang',
    requesterName: 'Wulan D.',
    reqType: 'Baru',
    date: '07 Jul 2026',
    step: 3,
    fulfillStep: 0,
  }),
  buildRequestItem({
    id: 'REQ-2085',
    outlet: 'Medan Kota',
    category: 'Server',
    qty: 4,
    pri: 'urgent',
    distributor: 'PT Mitra Jaya Abadi',
    salesDivision: 'M3',
    requesterRole: 'Cabang',
    requesterName: 'Agus T.',
    date: '10 Jul 2026',
    step: 3,
    fulfillStep: 1,
    fulfillData: { specs: '4x PC — Intel i5, 16GB RAM, 512GB SSD, Windows 11 Pro, untuk kasir outlet.' },
  }),
  buildRequestItem({
    id: 'REQ-2083',
    outlet: 'Bandung Kota',
    category: 'Barcode',
    qty: 6,
    pri: 'urgent',
    distributor: 'PT Distributor Utama',
    salesDivision: 'M1 CWC',
    requesterRole: 'SS',
    requesterName: 'Yoga P.',
    date: '06 Jul 2026',
    step: 4,
    fulfillStep: 0,
  }),
  buildRequestItem({
    id: 'REQ-2081',
    outlet: 'Bekasi Utara',
    category: 'Barcode',
    qty: 5,
    pri: 'normal',
    distributor: 'PT Karya Selaras',
    salesDivision: 'M1 BIS',
    requesterRole: 'RSM',
    requesterName: 'Nadia F.',
    date: '09 Jul 2026',
    step: 3,
    fulfillStep: 3,
    fulfillData: { codes: ['BC-100120', 'BC-100121', 'BC-100122', 'BC-100123', 'BC-100124'] },
  }),
  buildRequestItem({
    id: 'REQ-2078',
    outlet: 'Depok Tengah',
    category: 'Barcode',
    qty: 5,
    pri: 'normal',
    distributor: 'PT Distributor Utama',
    salesDivision: 'M1 CWC',
    requesterRole: 'SA',
    requesterName: 'Rio K.',
    date: '08 Jul 2026',
    step: -1,
  }),
  buildRequestItem({
    id: 'REQ-2074',
    outlet: 'Medan Kota',
    category: 'Android',
    qty: 3,
    pri: 'normal',
    distributor: 'PT Mitra Jaya Abadi',
    salesDivision: 'M245',
    requesterRole: 'SD',
    requesterName: 'Bu Lita',
    reqType: 'Peremajaan',
    date: '05 Jul 2026',
    step: 0,
    fulfillStep: 3,
    fulfillData: {
      units: [
        { imei: '354892019283741', brand: 'Samsung', model: 'Galaxy Tab', releaseYear: '2023', regYear: '2024' },
        { imei: '864920192837412', brand: 'Xiaomi', model: 'Redmi Note', releaseYear: '2022', regYear: '2023' },
        { imei: '358291029384756', brand: 'Oppo', model: 'A-series', releaseYear: '2024', regYear: '2025' },
      ],
    },
  }),
  buildRequestItem({
    id: 'REQ-2070',
    outlet: 'Cirebon Kota',
    category: 'Server',
    qty: 2,
    pri: 'urgent',
    distributor: 'CV Sumber Makmur',
    salesDivision: 'M3',
    requesterRole: 'Cabang',
    requesterName: 'Andi P.',
    date: '03 Jul 2026',
    step: -2,
  }),
]

export const requestService = {
  getRequests: async (filters: RequestFilter = {}): Promise<RequestDetailItem[]> => {
    try {
      const response = await httpClient.get<RequestDetailItem[]>('/api/requests', {
        params: filters,
      })
      return response.data
    } catch {
      // Fallback mock filtering
      let result = [...INITIAL_REQUESTS]

      if (filters.q) {
        const query = filters.q.trim().toLowerCase()
        result = result.filter(
          (r) =>
            r.id.toLowerCase().includes(query) ||
            r.outlet.toLowerCase().includes(query) ||
            r.by.toLowerCase().includes(query)
        )
      }

      if (filters.type && filters.type !== 'All types') {
        result = result.filter((r) => r.type === filters.type)
      }

      if (filters.status && filters.status !== 'All status') {
        const s = filters.status
        if (s === 'Waiting') {
          result = result.filter((r) => r.step >= 0 && r.step < r.chain.length)
        } else if (s === 'In progress') {
          result = result.filter((r) => r.statusTag.cls === 'brand')
        } else if (s === 'Completed') {
          result = result.filter((r) => r.statusTag.cls === 'go')
        }
      }

      return result
    }
  },

  getRequestById: async (id: string): Promise<RequestDetailItem | undefined> => {
    try {
      const response = await httpClient.get<RequestDetailItem>(`/api/requests/${id}`)
      return response.data
    } catch {
      return INITIAL_REQUESTS.find((r) => r.id === id)
    }
  },

  createRequest: async (input: CreateRequestFormInput): Promise<RequestDetailItem> => {
    const distributorName =
      input.distributor === '__other__' ? input.distributorManual || 'Manual Distributor' : input.distributor

    const newId = `REQ-${2100 + Math.floor(Math.random() * 900)}`
    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    const newItem = buildRequestItem({
      id: newId,
      outlet: input.outlet,
      category: input.category,
      qty: input.qty,
      pri: input.priority,
      distributor: distributorName,
      salesDivision: input.salesDivision,
      requesterRole: input.requesterRole,
      requesterName: input.requesterName,
      reqType: input.reqType,
      date: todayStr,
      step: 0,
    })

    try {
      const response = await httpClient.post<RequestDetailItem>('/api/requests', input)
      INITIAL_REQUESTS.unshift(response.data)
      return response.data
    } catch {
      INITIAL_REQUESTS.unshift(newItem)
      return newItem
    }
  },
}
