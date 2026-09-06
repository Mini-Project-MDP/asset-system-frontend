import type { RequestDetailItem, CategoryType } from '@/features/requests/types'

export type ApprovalTab = 'pending' | 'history'

export interface ApprovalFilter {
  q?: string
  type?: string
  tab?: ApprovalTab
  role?: string
}

export type ApprovalActionType = 'approve' | 'revision' | 'reject'

export interface ApprovalActionPayload {
  requestId: string
  action: ApprovalActionType
  comment?: string
  userRole?: string
}

export interface ApprovalsOverview {
  pending: RequestDetailItem[]
  history: RequestDetailItem[]
}
