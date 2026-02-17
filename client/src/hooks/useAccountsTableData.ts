import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createAccount, deleteAccount, fetchAccounts, updateAccount } from '../api/accountsApi'
import type { AccountCreateRequest, AccountDto, AccountUpdateRequest } from '../types/account'

export type AccountFilterDraft = {
  searchTerm?: string
}

type AccountFilters = {
  searchTerm?: string
}

type UseAccountsTableDataResult = {
  items: AccountDto[]
  accounts: AccountDto[]
  isLoading: boolean
  error: string | null
  page: number
  pageSize: number
  totalCount: number
  draftFilters: AccountFilterDraft
  onDraftFilterChange: (next: AccountFilterDraft) => void
  onApplyFilters: (next?: AccountFilterDraft) => void
  onResetFilters: () => void
  onPageChange: (page: number, pageSize: number) => void
  onCreateAccount: (request: AccountCreateRequest) => Promise<void>
  onUpdateAccount: (id: string, request: AccountUpdateRequest) => Promise<void>
  onDeleteAccount: (id: string) => Promise<void>
  isCreatingAccount: boolean
  isUpdatingAccount: boolean
  isDeletingAccount: boolean
}

const emptyDraftFilters: AccountFilterDraft = {
  searchTerm: undefined,
}
const emptyAccounts: AccountDto[] = []

function toTrimmedString(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeDraftFilters(draft: AccountFilterDraft): AccountFilters {
  return {
    searchTerm: toTrimmedString(draft.searchTerm)?.toLocaleLowerCase(),
  }
}

function toErrorMessage(error: unknown, fallbackMessage: string): string | null {
  if (!error) {
    return null
  }

  return error instanceof Error ? error.message : fallbackMessage
}

export function useAccountsTableData(): UseAccountsTableDataResult {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [draftFilters, setDraftFilters] = useState<AccountFilterDraft>(emptyDraftFilters)
  const [appliedFilters, setAppliedFilters] = useState<AccountFilters>({})

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: ({ signal }) => fetchAccounts(signal),
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (request: AccountCreateRequest) => createAccount(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['accounts'],
        refetchType: 'active',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: AccountUpdateRequest }) => updateAccount(id, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['accounts'],
        refetchType: 'active',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['accounts'],
        refetchType: 'active',
      })
    },
  })

  const rawAccounts = accountsQuery.data ?? emptyAccounts
  const filteredAccounts = useMemo(() => {
    const searchTerm = appliedFilters.searchTerm

    return rawAccounts.filter((account) => {
      if (!searchTerm) {
        return true
      }

      const searchValue = account.name.toLocaleLowerCase()
      return searchValue.includes(searchTerm)
    })
  }, [appliedFilters.searchTerm, rawAccounts])

  const totalCount = filteredAccounts.length

  const items = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return filteredAccounts.slice(start, end)
  }, [filteredAccounts, page, pageSize])

  const error = toErrorMessage(accountsQuery.error, t('errors.accountsLoad'))
  const isLoading = accountsQuery.isPending && !accountsQuery.data

  function onPageChange(nextPage: number, nextPageSize: number) {
    if (nextPageSize !== pageSize) {
      setPage(1)
      setPageSize(nextPageSize)
      return
    }

    setPage(nextPage)
  }

  function onDraftFilterChange(next: AccountFilterDraft) {
    setDraftFilters(next)
  }

  function onApplyFilters(next: AccountFilterDraft = draftFilters) {
    setAppliedFilters(normalizeDraftFilters(next))
    setPage(1)
  }

  function onResetFilters() {
    setDraftFilters(emptyDraftFilters)
    setAppliedFilters({})
    setPage(1)
  }

  async function onCreateAccount(request: AccountCreateRequest) {
    await createMutation.mutateAsync(request)
    setPage(1)
  }

  async function onUpdateAccount(id: string, request: AccountUpdateRequest) {
    await updateMutation.mutateAsync({ id, request })
  }

  async function onDeleteAccount(id: string) {
    await deleteMutation.mutateAsync(id)
    setPage((current) => {
      const nextTotalCount = Math.max(0, totalCount - 1)
      const maxPage = Math.max(1, Math.ceil(nextTotalCount / pageSize))
      return Math.min(current, maxPage)
    })
  }

  return {
    items,
    accounts: rawAccounts,
    isLoading,
    error,
    page,
    pageSize,
    totalCount,
    draftFilters,
    onDraftFilterChange,
    onApplyFilters,
    onResetFilters,
    onPageChange,
    onCreateAccount,
    onUpdateAccount,
    onDeleteAccount,
    isCreatingAccount: createMutation.isPending,
    isUpdatingAccount: updateMutation.isPending,
    isDeletingAccount: deleteMutation.isPending,
  }
}
