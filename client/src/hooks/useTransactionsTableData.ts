import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { fetchAccounts } from '../api/accountsApi'
import { fetchCategories } from '../api/categoriesApi'
import { fetchTransactionsPage } from '../api/transactionsApi'
import type { TransactionItem } from '../components/TransactionsTable'
import type { AccountDto } from '../types/account'
import type { CategoryDto } from '../types/category'
import type { TransactionFilters } from '../types/transaction'

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

function toErrorMessage(error: unknown): string | null {
  if (!error) {
    return null
  }

  return error instanceof Error ? error.message : 'Transaktionen konnten nicht geladen werden.'
}

export function useTransactionsTableData(): UseTransactionsTableDataResult {
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
          note: transaction.note,
          account: account?.name ?? '(Unbekanntes Konto)',
          category: category?.name ?? '(Unbekannte Kategorie)',
          bookedOn: transaction.bookedOn,
          quantity: transaction.amount,
          merchant: transaction.merchant?.trim() ? transaction.merchant : '-',
          currencyCode: account?.currencyCode ?? 'EUR',
        }
      }),
    [rawItems, accountsById, categoriesById],
  )

  const error =
    toErrorMessage(transactionsQuery.error) ??
    toErrorMessage(accountsQuery.error) ??
    toErrorMessage(categoriesQuery.error)

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
  }
}
