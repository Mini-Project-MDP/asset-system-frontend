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
