export type SettingsTab = 'outlets' | 'distributors' | 'types' | 'flow' | 'users'

export interface OutletItem {
  id: string
  code: string
  name: string
  region: string
  is_active: boolean
}

export interface OutletInput {
  code: string
  name: string
  region: string
  is_active?: boolean
}

export interface DistributorItem {
  id: string
  code: string
  name: string
  /** Names of the covered outlets, for display. */
  outlets: string[]
  /** Ids of the covered outlets, for editing. */
  outlet_ids: string[]
  is_active: boolean
}

export interface DistributorInput {
  code: string
  name: string
  outlet_ids: string[]
  is_active?: boolean
}

/** How an asset type is identified per unit at fulfillment. */
export type IdentifierType = 'NONE' | 'IMEI' | 'SERIAL_NUMBER'

export interface AssetTypeItem {
  id: string
  name: string
  code: string
  /** Display text, e.g. "No" or "Yes — IMEI required". */
  identifier: string
  identifier_type: IdentifierType
  identifier_required: boolean
  is_active: boolean
}

export interface AssetTypeInput {
  code: string
  name: string
  identifier: IdentifierType
  is_active?: boolean
}
