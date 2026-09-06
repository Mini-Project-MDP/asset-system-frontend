import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestService } from '../services/requestService'
import type { RequestFilter, CreateRequestFormInput } from '../types'

export const useGetRequests = (filters: RequestFilter = {}) => {
  return useQuery({
    queryKey: ['requests', filters],
    queryFn: () => requestService.getRequests(filters),
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
    },
  })
}
