import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { fulfillmentService } from '../services/fulfillmentService'
import type { FulfillmentFilter } from '../types'

export function useGetFulfillmentItems(filter: FulfillmentFilter = {}) {
  return useQuery({
    queryKey: ['fulfillmentItems', filter],
    queryFn: () => fulfillmentService.getFulfillmentItems(filter),
  })
}

export function useGetPhoneCatalog() {
  return useQuery({
    queryKey: ['phoneCatalog'],
    queryFn: fulfillmentService.getPhoneCatalog,
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetFulfillmentDetail(id: string) {
  return useQuery({
    queryKey: ['fulfillmentDetail', id],
    queryFn: () => fulfillmentService.getFulfillmentDetail(id),
    enabled: !!id,
  })
}

// Refetch everything a fulfillment step shows up in. Done after a failed call too:
// a step the server applied anyway (the browser timed out first), or one already
// taken in another tab (409), must not leave the page offering it again.
function refreshAfterFulfillmentStep(queryClient: QueryClient, id: string) {
  queryClient.invalidateQueries({ queryKey: ['fulfillmentItems'] })
  queryClient.invalidateQueries({ queryKey: ['fulfillmentDetail', id] })
  queryClient.invalidateQueries({ queryKey: ['requests'] })
  queryClient.invalidateQueries({ queryKey: ['request', id] })
  queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  queryClient.invalidateQueries({ queryKey: ['navigation', 'badges'] })
}

export function useSaveFulfillmentData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, fulfillData }: { id: string; fulfillData: unknown }) =>
      fulfillmentService.saveFulfillmentData(id, fulfillData),
    onSettled: (_, __, variables) => refreshAfterFulfillmentStep(queryClient, variables.id),
  })
}

export function useAdvanceFulfillmentStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fulfillmentService.advanceStage(id),
    onSettled: (_, __, id) => refreshAfterFulfillmentStep(queryClient, id),
  })
}
