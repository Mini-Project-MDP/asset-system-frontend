import { httpClient } from '@/shared/services/httpClient'
import type { RequestDetailItem } from '@/features/requests/types'
import type { ApprovalFilter, ApprovalActionPayload, ApprovalsOverview } from '../types'

export const approvalService = {
  getApprovals: async (filter: ApprovalFilter = {}): Promise<ApprovalsOverview> => {
    const response = await httpClient.get<RequestDetailItem[]>('/api/v1/approvals', {
      params: {
        q: filter.q,
        type: filter.type,
      },
    })
    const allRequests: RequestDetailItem[] = response.data || []
    const userRole = filter.role || 'admin'

    let pending: RequestDetailItem[] = []
    let history: RequestDetailItem[] = []

    if (userRole === 'admin') {
      pending = allRequests.filter((r) => {
        const isWaiting = r.statusTag?.text.startsWith('Waiting') || r.chain?.some((s) => s.status === 'current')
        return isWaiting && r.statusTag?.cls !== 'stop' && r.statusTag?.cls !== 'go'
      })
      history = allRequests.filter((r) => !pending.includes(r))
    } else {
      pending = allRequests.filter((r) => {
        const step = r.chain?.find((x) => x.role === userRole || x.roleLabel === userRole)
        return step && step.status === 'current'
      })
      history = allRequests.filter((r) => {
        const step = r.chain?.find((x) => x.role === userRole || x.roleLabel === userRole)
        return step && (step.status === 'approved' || step.status === 'revision' || step.status === 'rejected')
      })
    }

    return { pending, history }
  },

  getApprovalDetail: async (id: string): Promise<RequestDetailItem | undefined> => {
    try {
      const response = await httpClient.get<RequestDetailItem>(`/api/v1/approvals/${id}`)
      return response.data
    } catch (err: any) {
      if (err?.response?.status === 404) return undefined
      throw err
    }
  },

  actOnApproval: async (payload: ApprovalActionPayload): Promise<RequestDetailItem> => {
    const response = await httpClient.post<RequestDetailItem>(
      `/api/v1/approvals/${payload.requestId}/action`,
      {
        action: payload.action,
        comment: payload.comment,
      }
    )
    return response.data
  },
}
