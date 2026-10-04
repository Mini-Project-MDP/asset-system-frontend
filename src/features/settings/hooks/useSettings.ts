import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '../services/settingsService'
import type { OutletInput, DistributorInput, AssetTypeInput } from '../types'

export function useGetSettingsOutlets(includeInactive = false) {
  return useQuery({
    queryKey: ['settings', 'outlets', { includeInactive }],
    queryFn: () => settingsService.getOutlets(includeInactive),
  })
}

export function useAddOutlet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (outlet: OutletInput) => settingsService.addOutlet(outlet),
    onSuccess: () => {
      // Distributors list the names of their outlets, so refresh both.
      queryClient.invalidateQueries({ queryKey: ['settings', 'outlets'] })
      queryClient.invalidateQueries({ queryKey: ['settings', 'distributors'] })
    },
  })
}

export function useUpdateOutlet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OutletInput }) =>
      settingsService.updateOutlet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'outlets'] })
      queryClient.invalidateQueries({ queryKey: ['settings', 'distributors'] })
    },
  })
}

export function useGetSettingsDistributors(includeInactive = false) {
  return useQuery({
    queryKey: ['settings', 'distributors', { includeInactive }],
    queryFn: () => settingsService.getDistributors(includeInactive),
  })
}

export function useAddDistributor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dist: DistributorInput) => settingsService.addDistributor(dist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'distributors'] })
    },
  })
}

export function useUpdateDistributor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DistributorInput }) =>
      settingsService.updateDistributor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'distributors'] })
    },
  })
}

export function useGetSettingsTypes(includeInactive = false) {
  return useQuery({
    queryKey: ['settings', 'types', { includeInactive }],
    queryFn: () => settingsService.getTypes(includeInactive),
  })
}

export function useAddType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (type: AssetTypeInput) => settingsService.addType(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'types'] })
    },
  })
}

export function useUpdateType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssetTypeInput }) =>
      settingsService.updateType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'types'] })
    },
  })
}

export function useGetSettingsFlow() {
  return useQuery({
    queryKey: ['settings', 'flow'],
    queryFn: settingsService.getFlow,
  })
}
