import type { RequestDetailItem } from '@/features/requests/types'

export type FulfillmentTab = 'pending' | 'history'

export interface FulfillmentFilter {
  q?: string
  type?: string
  tab?: FulfillmentTab
}

export interface BarcodeFulfillmentInput {
  codes: string[]
}

/** A device identified from its IMEI (via the TAC reference table). */
export interface ImeiInfo {
  brand: string
  model: string
  releaseYear: string
}

export interface PhoneModel {
  id: string
  brand_id: string
  name: string
  is_active: boolean
}

/** A phone brand and its models, as offered in the Android fulfillment form. */
export interface PhoneBrand {
  id: string
  name: string
  is_active: boolean
  models: PhoneModel[]
}

export interface AndroidUnitInput {
  imei: string
  brand: string
  model: string
  releaseYear: string
  regYear: string
}

export interface AndroidFulfillmentInput {
  units: AndroidUnitInput[]
}

export interface ServerFulfillmentInput {
  specs: string
}

export type FulfillmentDataInput =
  | BarcodeFulfillmentInput
  | AndroidFulfillmentInput
  | ServerFulfillmentInput

export interface FulfillmentOverview {
  pending: RequestDetailItem[]
  history: RequestDetailItem[]
}
