import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchAccounts } from '../api/accountsApi'
import { fetchCategories } from '../api/categoriesApi'
import {
  archiveTransactions,
  createTransaction,
  deleteTransaction,
  fetchTransactionsPage,
  updateTransaction,
} from '../api/transactionsApi'
import { UNCATEGORIZED_CATEGORY_ID } from '../constants/system'
import type { TransactionItem } from '../components/TransactionsTable'
import type { AccountDto } from '../types/account'
import type { CategoryDto } from '../types/category'
import type {
  TransactionCreateRequest,
  TransactionDto,
  TransactionFilters,
  TransactionPageDto,
  TransactionType,
  TransactionUpdateRequest,
} from '../types/transaction'

export type TransactionFilterDraft = {
  accountId?: string
  categoryId?: string
  type?: TransactionType
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
  onApplyFilters: (next?: TransactionFilterDraft) => void
  onResetFilters: () => void
  onPageChange: (page: number, pageSize: number) => void
  onCreateTransaction: (request: TransactionCreateRequest) => Promise<void>
  onUpdateTransaction: (id: string, request: TransactionUpdateRequest) => Promise<void>
  onDeleteTransaction: (id: string) => Promise<void>
  onArchiveTransactions: (ids: string[]) => Promise<void>
  isCreatingTransaction: boolean
  isUpdatingTransaction: boolean
  isDeletingTransaction: boolean
  isArchivingTransaction: boolean
}

const emptyDraftFilters: TransactionFilterDraft = {
  accountId: undefined,
  categoryId: undefined,
  type: undefined,
  bookedFrom: undefined,
  bookedTo: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  searchTerm: undefined,
}
const emptyAccounts: AccountDto[] = []
const emptyCategories: CategoryDto[] = []
const emptyTransactionItems: TransactionDto[] = []

type TransactionQueryData = TransactionPageDto | TransactionDto[]
type TransactionsSnapshot = Array<[readonly unknown[], TransactionQueryData | undefined]>

function isTransactionPageData(data: TransactionQueryData | undefined): data is TransactionPageDto {
  if (!data || Array.isArray(data)) {
    return false
  }

  return Array.isArray(data.items)
}

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
    type: draft.type,
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

      const previousQueries = queryClient.getQueriesData<TransactionQueryData>({
        queryKey: ['transactions'],
      })

      queryClient.setQueriesData<TransactionQueryData>({ queryKey: ['transactions'] }, (current) => {
        if (!isTransactionPageData(current)) {
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
            type: request.type ?? item.type,
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

  const createMutation = useMutation({
    mutationFn: (request: TransactionCreateRequest) => createTransaction(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['transactions'],
        refetchType: 'active',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] })

      const previousQueries = queryClient.getQueriesData<TransactionQueryData>({
        queryKey: ['transactions'],
      })

      queryClient.setQueriesData<TransactionQueryData>({ queryKey: ['transactions'] }, (current) => {
        if (!isTransactionPageData(current)) {
          return current
        }

        const nextItems = current.items.filter((item) => item.id !== id)
        if (nextItems.length === current.items.length) {
          return current
        }

        return {
          ...current,
          items: nextItems,
          totalCount: Math.max(0, current.totalCount - 1),
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

  const archiveMutation = useMutation({
    mutationFn: (ids: string[]) => archiveTransactions(ids),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['transactions'],
        refetchType: 'active',
      })

      setPage((current) => {
        const nextTotalCount = Math.max(0, (transactionsQuery.data?.totalCount ?? 0) - variables.length)
        const maxPage = Math.max(1, Math.ceil(nextTotalCount / pageSize))
        return Math.min(current, maxPage)
      })
    },
  })

  const accounts = accountsQuery.data ?? emptyAccounts
  const categories = categoriesQuery.data ?? emptyCategories
  const rawItems = transactionsQuery.data?.items ?? emptyTransactionItems

  const accountsById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts])
  const categoriesById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories])

  const items: TransactionItem[] = useMemo(
    () =>
      rawItems.map((transaction) => {
        const account = accountsById.get(transaction.accountId)
        const category = categoriesById.get(transaction.categoryId)
        const categoryName =
          transaction.categoryId === UNCATEGORIZED_CATEGORY_ID
            ? t('categories.uncategorized')
            : category?.name ?? t('transactions.fallback.unknownCategory')

        return {
          id: transaction.id,
          accountId: transaction.accountId,
          categoryId: transaction.categoryId,
          note: transaction.note,
          account: account?.name ?? t('transactions.fallback.unknownAccount'),
          category: categoryName,
          bookedOn: transaction.bookedOn,
          quantity: transaction.amount,
          type: transaction.type,
          merchant: transaction.merchant?.trim() ? transaction.merchant : '-',
          merchantValue: transaction.merchant?.trim() ? transaction.merchant.trim() : undefined,
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

  function onApplyFilters(next: TransactionFilterDraft = draftFilters) {
    setAppliedFilters(normalizeDraftFilters(next))
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

  async function onCreateTransaction(request: TransactionCreateRequest) {
    await createMutation.mutateAsync(request)
    setPage(1)
  }

  async function onDeleteTransaction(id: string) {
    await deleteMutation.mutateAsync(id)
  }

  async function onArchiveTransactions(ids: string[]) {
    if (ids.length === 0) {
      return
    }

    await archiveMutation.mutateAsync(ids)
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
    onCreateTransaction,
    onUpdateTransaction,
    onDeleteTransaction,
    onArchiveTransactions,
    isCreatingTransaction: createMutation.isPending,
    isUpdatingTransaction: updateMutation.isPending,
    isDeletingTransaction: deleteMutation.isPending,
    isArchivingTransaction: archiveMutation.isPending,
  }
}
