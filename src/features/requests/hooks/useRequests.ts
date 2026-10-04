import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestService } from '../services/requestService'
import type { RequestFilter, CreateRequestFormInput } from '../types'

export const useGetRequests = (filters: RequestFilter = {}) => {
  return useQuery({
    queryKey: ['requests', filters],
    queryFn: () => requestService.getRequests(filters),
    // Keep the current rows on screen while a new search or filter loads.
    placeholderData: keepPreviousData,
  })
}

/** What the New Request form offers (distributors, outlets, divisions, roles). */
export const useRequestFormOptions = () => {
  return useQuery({
    queryKey: ['requests', 'form-options'],
    queryFn: requestService.getFormOptions,
    staleTime: 5 * 60 * 1000,
  })
}

export const useGetRequestDetail = (id: string) => {
  return useQuery({
    queryKey: ['request', id],
    queryFn: () => requestService.getRequestById(id),
    enabled: !!id && id !== 'new',
  })
}

export const useCreateRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRequestFormInput) => requestService.createRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['navigation', 'badges'] })
    },
  })
}
