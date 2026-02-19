import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clearDemoData, fetchDemoDataExists, seedDemoData } from '../api/demoDataApi'

export function useDemoData() {
  const queryClient = useQueryClient()
  const isDev = import.meta.env.DEV

  const statusQuery = useQuery({
    queryKey: ['demoDataExists'],
    queryFn: ({ signal }) => fetchDemoDataExists(signal),
    enabled: isDev,
  })

  const seedMutation = useMutation({
    mutationFn: () => seedDemoData(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['demoDataExists'], refetchType: 'active' })
    },
  })

  const clearMutation = useMutation({
    mutationFn: () => clearDemoData(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['demoDataExists'], refetchType: 'active' })
    },
  })

  const exists = statusQuery.data?.exists ?? false
  const isLoading = statusQuery.isPending
  const isUpdating = seedMutation.isPending || clearMutation.isPending

  return {
    exists,
    isLoading,
    error: statusQuery.error ? (statusQuery.error as Error).message : null,
    toggle: async (enabled: boolean) => {
      if (enabled) {
        await seedMutation.mutateAsync()
      } else {
        await clearMutation.mutateAsync()
      }
    },
    isUpdating,
  }
}
