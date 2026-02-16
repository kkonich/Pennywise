import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchAccounts } from '../api/accountsApi'
import { fetchCategories } from '../api/categoriesApi'
import { fetchTransactionsPage, updateTransaction } from '../api/transactionsApi'
import type { TransactionItem } from '../components/TransactionsTable'
import type { AccountDto } from '../types/account'
import type { CategoryDto } from '../types/category'
import type { TransactionDto, TransactionFilters, TransactionPageDto, TransactionUpdateRequest } from '../types/transaction'

export type TransactionFilterDraft = {
  accountId?: string
  categoryId?: string
  bookedFrom?: string
  bookedTo?: string
  minAmount?: string
  maxAmount?: string
  searchTerm?: string
}

type UseTransactionsTableDataResult = {
  items: TransactionItem[]
  isLoading: boolean
  error: string | null
  page: number
  pageSize: number
  totalCount: number
  accounts: AccountDto[]
  categories: CategoryDto[]
  draftFilters: TransactionFilterDraft
  onDraftFilterChange: (next: TransactionFilterDraft) => void
  onApplyFilters: () => void
  onResetFilters: () => void
  onPageChange: (page: number, pageSize: number) => void
  onUpdateTransaction: (id: string, request: TransactionUpdateRequest) => Promise<void>
  isUpdatingTransaction: boolean
}

const emptyDraftFilters: TransactionFilterDraft = {
  accountId: undefined,
  categoryId: undefined,
  bookedFrom: undefined,
  bookedTo: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  searchTerm: undefined,
}

type TransactionsSnapshot = Array<[readonly unknown[], TransactionPageDto | undefined]>

function toTrimmedString(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeDraftFilters(draft: TransactionFilterDraft): TransactionFilters {
  return {
    accountId: draft.accountId,
    categoryId: draft.categoryId,
    bookedFrom: draft.bookedFrom,
    bookedTo: draft.bookedTo,
    minAmount: toNumber(draft.minAmount),
    maxAmount: toNumber(draft.maxAmount),
    searchTerm: toTrimmedString(draft.searchTerm),
  }
}

function toErrorMessage(error: unknown, fallbackMessage: string): string | null {
  if (!error) {
    return null
  }

  return error instanceof Error ? error.message : fallbackMessage
}

export function useTransactionsTableData(): UseTransactionsTableDataResult {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [draftFilters, setDraftFilters] = useState<TransactionFilterDraft>(emptyDraftFilters)
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>({})

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: ({ signal }) => fetchAccounts(signal),
    staleTime: 5 * 60 * 1000,
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: 5 * 60 * 1000,
  })

  const transactionsQuery = useQuery({
    queryKey: ['transactions', page, pageSize, appliedFilters],
    queryFn: ({ signal }) =>
      fetchTransactionsPage({
        page,
        pageSize,
        filters: appliedFilters,
        signal,
      }),
    placeholderData: keepPreviousData,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: TransactionUpdateRequest }) => updateTransaction(id, request),
    onMutate: async ({ id, request }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] })

      const previousQueries = queryClient.getQueriesData<TransactionPageDto>({
        queryKey: ['transactions'],
      })

      queryClient.setQueriesData<TransactionPageDto>({ queryKey: ['transactions'] }, (current) => {
        if (!current) {
          return current
        }

        let hasChanged = false
        const nextItems = current.items.map((item) => {
          if (item.id !== id) {
            return item
          }

          hasChanged = true
          const merchant = request.merchant?.trim() ? request.merchant.trim() : null
          return {
            ...item,
            accountId: request.accountId,
            categoryId: request.categoryId,
            bookedOn: request.bookedOn,
            amount: request.amount,
            note: request.note,
            merchant,
          } satisfies TransactionDto
        })

        if (!hasChanged) {
          return current
        }

        return {
          ...current,
          items: nextItems,
        }
      })

      return { previousQueries: previousQueries as TransactionsSnapshot }
    },
    onError: (_error, _variables, context) => {
      if (!context?.previousQueries) {
        return
      }

      context.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['transactions'],
        refetchType: 'active',
      })
    },
  })

  const accounts = accountsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const rawItems = transactionsQuery.data?.items ?? []

  const accountsById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts])
  const categoriesById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories])

  const items: TransactionItem[] = useMemo(
    () =>
      rawItems.map((transaction) => {
        const account = accountsById.get(transaction.accountId)
        const category = categoriesById.get(transaction.categoryId)

        return {
          id: transaction.id,
          accountId: transaction.accountId,
          categoryId: transaction.categoryId,
          note: transaction.note,
          account: account?.name ?? t('transactions.fallback.unknownAccount'),
          category: category?.name ?? t('transactions.fallback.unknownCategory'),
          bookedOn: transaction.bookedOn,
          quantity: transaction.amount,
          merchant: transaction.merchant?.trim() ? transaction.merchant : '-',
          merchantValue: transaction.merchant?.trim() ? transaction.merchant.trim() : undefined,
          currencyCode: account?.currencyCode ?? 'EUR',
        }
      }),
    [rawItems, accountsById, categoriesById, t],
  )

  const transactionsLoadError = t('errors.transactionsLoad')
  const error =
    toErrorMessage(transactionsQuery.error, transactionsLoadError) ??
    toErrorMessage(accountsQuery.error, transactionsLoadError) ??
    toErrorMessage(categoriesQuery.error, transactionsLoadError)

  const isLoading = transactionsQuery.isPending && !transactionsQuery.data

  function onPageChange(nextPage: number, nextPageSize: number) {
    if (nextPageSize !== pageSize) {
      setPage(1)
      setPageSize(nextPageSize)
      return
    }

    setPage(nextPage)
  }

  function onDraftFilterChange(next: TransactionFilterDraft) {
    setDraftFilters(next)
  }

  function onApplyFilters() {
    setAppliedFilters(normalizeDraftFilters(draftFilters))
    setPage(1)
  }

  function onResetFilters() {
    setDraftFilters(emptyDraftFilters)
    setAppliedFilters({})
    setPage(1)
  }

  async function onUpdateTransaction(id: string, request: TransactionUpdateRequest) {
    await updateMutation.mutateAsync({ id, request })
  }

  return {
    items,
    isLoading,
    error,
    page,
    pageSize,
    totalCount: transactionsQuery.data?.totalCount ?? 0,
    accounts,
    categories,
    draftFilters,
    onDraftFilterChange,
    onApplyFilters,
    onResetFilters,
    onPageChange,
    onUpdateTransaction,
    isUpdatingTransaction: updateMutation.isPending,
  }
}
