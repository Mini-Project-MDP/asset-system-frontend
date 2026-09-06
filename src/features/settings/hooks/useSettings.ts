import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '../services/settingsService'
import type { OutletItem, DistributorItem, AssetTypeItem, UserRoleItem } from '../types'

export function useGetSettingsOutlets() {
  return useQuery({
    queryKey: ['settings', 'outlets'],
    queryFn: settingsService.getOutlets,
  })
}

export function useAddOutlet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (outlet: Omit<OutletItem, 'id'>) => settingsService.addOutlet(outlet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'outlets'] })
    },
  })
}

export function useUpdateOutlet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OutletItem> }) =>
      settingsService.updateOutlet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'outlets'] })
    },
  })
}

export function useGetSettingsDistributors() {
  return useQuery({
    queryKey: ['settings', 'distributors'],
    queryFn: settingsService.getDistributors,
  })
}

export function useAddDistributor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dist: Omit<DistributorItem, 'id'>) => settingsService.addDistributor(dist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'distributors'] })
    },
  })
}

export function useUpdateDistributor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DistributorItem> }) =>
      settingsService.updateDistributor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'distributors'] })
    },
  })
}

export function useGetSettingsTypes() {
  return useQuery({
    queryKey: ['settings', 'types'],
    queryFn: settingsService.getTypes,
  })
}

export function useAddType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (type: Omit<AssetTypeItem, 'id'>) => settingsService.addType(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'types'] })
    },
  })
}

export function useUpdateType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssetTypeItem> }) =>
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

export function useGetSettingsUsers() {
  return useQuery({
    queryKey: ['settings', 'users'],
    queryFn: settingsService.getUsers,
  })
}

export function useAddUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (user: Omit<UserRoleItem, 'id'>) => settingsService.addUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserRoleItem> }) =>
      settingsService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] })
    },
  })
}
