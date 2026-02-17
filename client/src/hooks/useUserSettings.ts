import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchUserSettings, updateUserSettings } from '../api/settingsApi'
import type { UserSettingsDto, UserSettingsUpdateRequest } from '../types/settings'

type UseUserSettingsResult = {
  settings: UserSettingsDto | null
  isLoading: boolean
  error: string | null
  updateCurrency: (currencyCode: string) => Promise<void>
  isUpdating: boolean
}

function toErrorMessage(error: unknown): string | null {
  if (!error) {
    return null
  }

  return error instanceof Error ? error.message : 'Unknown error while loading settings.'
}

export function useUserSettings(): UseUserSettingsResult {
  const queryClient = useQueryClient()

  const settingsQuery = useQuery({
    queryKey: ['userSettings'],
    queryFn: ({ signal }) => fetchUserSettings(signal),
    staleTime: 10 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: (request: UserSettingsUpdateRequest) => updateUserSettings(request),
    onSuccess: async (_response, request) => {
      queryClient.setQueryData<UserSettingsDto>(['userSettings'], {
        currencyCode: request.currencyCode,
      })

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['userSettings'],
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: ['accounts'],
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: ['transactions'],
          refetchType: 'active',
        }),
      ])
    },
  })

  const settings = settingsQuery.data ?? null
  const error = useMemo(
    () => toErrorMessage(settingsQuery.error) ?? toErrorMessage(updateMutation.error),
    [settingsQuery.error, updateMutation.error],
  )

  return {
    settings,
    isLoading: settingsQuery.isPending && !settingsQuery.data,
    error,
    updateCurrency: async (currencyCode: string) => {
      const normalized = currencyCode.trim().toUpperCase()
      await updateMutation.mutateAsync({ currencyCode: normalized })
    },
    isUpdating: updateMutation.isPending,
  }
}
