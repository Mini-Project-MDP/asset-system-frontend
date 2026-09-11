import { httpClient } from '@/shared/services/httpClient'
import { CATEGORY_HIERARCHY, ROLE_LABELS } from '@/features/requests/services/requestService'
import type { OutletItem, DistributorItem, AssetTypeItem, UserRoleItem } from '../types'

export const INITIAL_OUTLETS: OutletItem[] = [
  { id: '1', code: 'OUT-011', name: 'Bandung Kota', region: 'West Java' },
  { id: '2', code: 'OUT-014', name: 'Surabaya Timur', region: 'East Java' },
  { id: '3', code: 'OUT-021', name: 'Medan Kota', region: 'North Sumatra' },
  { id: '4', code: 'OUT-008', name: 'Bekasi Utara', region: 'West Java' },
  { id: '5', code: 'OUT-030', name: 'Depok Tengah', region: 'West Java' },
  { id: '6', code: 'OUT-025', name: 'Cirebon Kota', region: 'West Java' },
]

export const INITIAL_DISTRIBUTORS: DistributorItem[] = [
  {
    id: '1',
    name: 'PT Subur Jaya',
    outlets: ['Bandung Kota', 'Cirebon Kota', 'Depok Tengah'],
  },
  {
    id: '2',
    name: 'PT Bintang Perkasa',
    outlets: ['Surabaya Timur', 'Malang Kota', 'Kediri Selatan'],
  },
  {
    id: '3',
    name: 'PT Sumatra Distribusi',
    outlets: ['Medan Kota', 'Palembang Central', 'Pekanbaru Barat'],
  },
  {
    id: '4',
    name: 'PT Megah Logistics',
    outlets: ['Bekasi Utara', 'Bogor Raya', 'Tangerang Kota'],
  },
]

export const INITIAL_TYPES: AssetTypeItem[] = [
  { id: '1', name: 'Barcode', code: 'BC', identifier: 'No' },
  { id: '2', name: 'Android', code: 'AN', identifier: 'Yes — IMEI required' },
  { id: '3', name: 'Server', code: 'SR', identifier: 'Yes — Serial required' },
]

export const INITIAL_USERS: UserRoleItem[] = [
  { id: '1', name: 'Laras P.', email: 'laras@company.co', role: 'Sales Supervisor' },
  { id: '2', name: 'Dimas W.', email: 'dimas@company.co', role: 'Regional Sales Manager' },
  { id: '3', name: 'Bu Lita', email: 'lita@company.co', role: 'Group Regional Sales Manager' },
  { id: '4', name: 'Rani S.', email: 'rani@company.co', role: 'Sales Admin' },
  { id: '5', name: 'Bu Laras', email: 'laras.at@company.co', role: 'Asset Team' },
  { id: '6', name: 'Andi P.', email: 'andi@company.co', role: 'Admin' },
]

let outletsStore = [...INITIAL_OUTLETS]
let distributorsStore = [...INITIAL_DISTRIBUTORS]
let typesStore = [...INITIAL_TYPES]
let usersStore = [...INITIAL_USERS]

export const settingsService = {
  // Outlets
  getOutlets: async (): Promise<OutletItem[]> => {
    try {
      const res = await httpClient.get<OutletItem[]>('/api/v1/settings/outlets')
      return res.data
    } catch {
      return [...outletsStore]
    }
  },
  addOutlet: async (outlet: Omit<OutletItem, 'id'>): Promise<OutletItem> => {
    const newItem = { id: String(Date.now()), ...outlet }
    outletsStore.push(newItem)
    return newItem
  },
  updateOutlet: async (id: string, outlet: Partial<OutletItem>): Promise<OutletItem> => {
    outletsStore = outletsStore.map((o) => (o.id === id ? { ...o, ...outlet } : o))
    const updated = outletsStore.find((o) => o.id === id)
    if (!updated) throw new Error('Outlet not found')
    return updated
  },

  // Distributors
  getDistributors: async (): Promise<DistributorItem[]> => {
    try {
      const res = await httpClient.get<DistributorItem[]>('/api/v1/settings/distributors')
      return res.data
    } catch {
      return [...distributorsStore]
    }
  },
  addDistributor: async (dist: Omit<DistributorItem, 'id'>): Promise<DistributorItem> => {
    const newItem = { id: String(Date.now()), ...dist }
    distributorsStore.push(newItem)
    return newItem
  },
  updateDistributor: async (id: string, dist: Partial<DistributorItem>): Promise<DistributorItem> => {
    distributorsStore = distributorsStore.map((d) => (d.id === id ? { ...d, ...dist } : d))
    const updated = distributorsStore.find((d) => d.id === id)
    if (!updated) throw new Error('Distributor not found')
    return updated
  },

  // Types
  getTypes: async (): Promise<AssetTypeItem[]> => {
    try {
      const res = await httpClient.get<AssetTypeItem[]>('/api/v1/settings/types')
      return res.data
    } catch {
      return [...typesStore]
    }
  },
  addType: async (type: Omit<AssetTypeItem, 'id'>): Promise<AssetTypeItem> => {
    const newItem = { id: String(Date.now()), ...type }
    typesStore.push(newItem)
    return newItem
  },
  updateType: async (id: string, type: Partial<AssetTypeItem>): Promise<AssetTypeItem> => {
    typesStore = typesStore.map((t) => (t.id === id ? { ...t, ...type } : t))
    const updated = typesStore.find((t) => t.id === id)
    if (!updated) throw new Error('Asset type not found')
    return updated
  },

  // Flow
  getFlow: async () => {
    return {
      hierarchy: CATEGORY_HIERARCHY,
      roleLabels: ROLE_LABELS,
    }
  },

  // Users
  getUsers: async (): Promise<UserRoleItem[]> => {
    try {
      const res = await httpClient.get<UserRoleItem[]>('/api/v1/users')
      return res.data
    } catch {
      return [...usersStore]
    }
  },
  addUser: async (user: Omit<UserRoleItem, 'id'>): Promise<UserRoleItem> => {
    const newItem = { id: String(Date.now()), ...user }
    usersStore.push(newItem)
    return newItem
  },
  updateUser: async (id: string, user: Partial<UserRoleItem>): Promise<UserRoleItem> => {
    usersStore = usersStore.map((u) => (u.id === id ? { ...u, ...user } : u))
    const updated = usersStore.find((u) => u.id === id)
    if (!updated) throw new Error('User not found')
    return updated
  },
}
