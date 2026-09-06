import { httpClient } from '@/shared/services/httpClient'
import type { RequestDetailItem } from '@/features/requests/types'
import { requestService, ROLE_LABELS, FULFILL_STAGES } from '@/features/requests/services/requestService'
import type { ApprovalFilter, ApprovalActionPayload, ApprovalsOverview } from '../types'

export const approvalService = {
  getApprovals: async (filter: ApprovalFilter = {}): Promise<ApprovalsOverview> => {
    try {
      const response = await httpClient.get<ApprovalsOverview>('/api/approvals', {
        params: filter,
      })
      return response.data
    } catch {
      const allRequests = await requestService.getRequests()
      const userRole = filter.role || 'admin'
      const q = filter.q?.toLowerCase() || ''
      const typeFilter = filter.type || 'All types'

      // Filter by search and type
      const filtered = allRequests.filter((r) => {
        const matchesQ =
          !q ||
          r.id.toLowerCase().includes(q) ||
          r.outlet.toLowerCase().includes(q) ||
          r.by.toLowerCase().includes(q)
        const matchesType = typeFilter === 'All types' || r.type === typeFilter
        return matchesQ && matchesType
      })

      // Separate into pending vs history
      let pending: RequestDetailItem[] = []
      let history: RequestDetailItem[] = []

      if (userRole === 'admin') {
        pending = filtered.filter((r) => r.step >= 0 && r.step < r.chain.length)
        history = filtered.filter(
          (r) => (r.step >= 0 && r.step >= r.chain.length) || r.step === -1 || r.step === -2
        )
      } else {
        pending = filtered.filter((r) => {
          const n = r.chain.find((x) => x.role === userRole)
          return n && n.status === 'current'
        })
        history = filtered.filter((r) => {
          const n = r.chain.find((x) => x.role === userRole)
          return n && (n.status === 'approved' || n.status === 'revision' || n.status === 'rejected')
        })
      }

      return { pending, history }
    }
  },

  getApprovalDetail: async (id: string): Promise<RequestDetailItem | undefined> => {
    try {
      const response = await httpClient.get<RequestDetailItem>(`/api/approvals/${id}`)
      return response.data
    } catch {
      return requestService.getRequestById(id)
    }
  },

  actOnApproval: async (payload: ApprovalActionPayload): Promise<RequestDetailItem> => {
    try {
      const response = await httpClient.post<RequestDetailItem>(
        `/api/approvals/${payload.requestId}/action`,
        payload
      )
      return response.data
    } catch {
      // Local fallback state mutation
      const req = await requestService.getRequestById(payload.requestId)
      if (!req) throw new Error('Request not found')

      const idx = req.step
      if (idx < 0 || idx >= req.chain.length) {
        throw new Error('This request is not currently waiting for approval step')
      }

      const roleLbl = req.chain[idx]?.roleLabel || req.chain[idx]?.role || 'Approver'
      const todayStr = 'Today'

      if (payload.action === 'approve') {
        req.chain[idx].status = 'approved'
        req.hist.push({ role: roleLbl, action: 'Approved', date: todayStr, type: 'go' })

        if (idx < req.chain.length - 1) {
          req.step = idx + 1
          req.chain[req.step].status = 'current'
          const nextRoleLabel = req.chain[req.step].roleLabel || req.chain[req.step].role
          req.statusTag = { cls: 'warn', text: `Waiting — ${nextRoleLabel}` }
        } else {
          req.step = req.chain.length
          req.fulfillStep = 0
          req.statusTag = { cls: 'brand', text: `Fulfillment — ${FULFILL_STAGES[0]}` }
        }
      } else if (payload.action === 'revision') {
        req.chain[idx].status = 'revision'
        req.hist.push({ role: roleLbl, action: 'Requested revision', date: todayStr, type: 'warn' })
        req.statusTag = { cls: 'warn', text: `Revision — ${roleLbl}` }
        req.step = -1
      } else if (payload.action === 'reject') {
        req.chain[idx].status = 'rejected'
        req.hist.push({ role: roleLbl, action: 'Rejected', date: todayStr, type: 'stop' })
        req.statusTag = { cls: 'stop', text: `Rejected — ${roleLbl}` }
        req.step = -2
      }

      return { ...req }
    }
  },
}
