export type SettingsTab = 'outlets' | 'distributors' | 'types' | 'flow' | 'users'

export interface OutletItem {
  id: string
  code: string
  name: string
  region: string
}

export interface DistributorItem {
  id: string
  name: string
  outlets: string[]
}

export interface AssetTypeItem {
  id: string
  name: string
  code: string
  identifier: string
}

export interface UserRoleItem {
  id: string
  name: string
  email: string
  role: string
}
