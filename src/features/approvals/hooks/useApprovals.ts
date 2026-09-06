import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { approvalService } from '../services/approvalService'
import type { ApprovalFilter, ApprovalActionPayload } from '../types'

export function useGetApprovals(filter: ApprovalFilter = {}) {
  return useQuery({
    queryKey: ['approvals', filter],
    queryFn: () => approvalService.getApprovals(filter),
  })
}

export function useGetApprovalDetail(id: string) {
  return useQuery({
    queryKey: ['approval', id],
    queryFn: () => approvalService.getApprovalDetail(id),
    enabled: !!id,
  })
}

export function useActOnApproval() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ApprovalActionPayload) => approvalService.actOnApproval(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      queryClient.invalidateQueries({ queryKey: ['approval', variables.requestId] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['request', variables.requestId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
