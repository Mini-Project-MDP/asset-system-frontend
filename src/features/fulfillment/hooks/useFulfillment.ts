import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fulfillmentService } from '../services/fulfillmentService'
import type { FulfillmentFilter } from '../types'

export function useGetFulfillmentItems(filter: FulfillmentFilter = {}) {
  return useQuery({
    queryKey: ['fulfillmentItems', filter],
    queryFn: () => fulfillmentService.getFulfillmentItems(filter),
  })
}

export function useGetFulfillmentDetail(id: string) {
  return useQuery({
    queryKey: ['fulfillmentDetail', id],
    queryFn: () => fulfillmentService.getFulfillmentDetail(id),
    enabled: !!id,
  })
}

export function useSaveFulfillmentData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, fulfillData }: { id: string; fulfillData: unknown }) =>
      fulfillmentService.saveFulfillmentData(id, fulfillData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fulfillmentItems'] })
      queryClient.invalidateQueries({ queryKey: ['fulfillmentDetail', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['request', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useAdvanceFulfillmentStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fulfillmentService.advanceStage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['fulfillmentItems'] })
      queryClient.invalidateQueries({ queryKey: ['fulfillmentDetail', id] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['request', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
