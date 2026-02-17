import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { archiveCategories, createCategory, deleteCategory, fetchCategories, updateCategory } from '../api/categoriesApi'
import { fetchTransactionsPage } from '../api/transactionsApi'
import type { CategoryCreateRequest, CategoryDto, CategoryUpdateRequest } from '../types/category'
import type { TransactionDto } from '../types/transaction'

export type CategoryFilterDraft = {
  searchTerm?: string
}

type CategoryFilters = {
  searchTerm?: string
}

type UseCategoriesTableDataResult = {
  items: CategoryDto[]
  spentByCategoryId: Record<string, number>
  isLoading: boolean
  error: string | null
  page: number
  pageSize: number
  totalCount: number
  draftFilters: CategoryFilterDraft
  onDraftFilterChange: (next: CategoryFilterDraft) => void
  onApplyFilters: (next?: CategoryFilterDraft) => void
  onResetFilters: () => void
  onPageChange: (page: number, pageSize: number) => void
  onCreateCategory: (request: CategoryCreateRequest) => Promise<void>
  onUpdateCategory: (id: string, request: CategoryUpdateRequest) => Promise<void>
  onDeleteCategory: (id: string) => Promise<void>
  onArchiveCategories: (ids: string[]) => Promise<void>
  isCreatingCategory: boolean
  isUpdatingCategory: boolean
  isDeletingCategory: boolean
  isArchivingCategory: boolean
}

const emptyDraftFilters: CategoryFilterDraft = {
  searchTerm: undefined,
}
const emptyCategories: CategoryDto[] = []
const emptyTransactions: TransactionDto[] = []
const transactionsPageSize = 100

function toTrimmedString(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeDraftFilters(draft: CategoryFilterDraft): CategoryFilters {
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

async function fetchAllTransactions(signal?: AbortSignal): Promise<TransactionDto[]> {
  const maxPages = 500
  const allItems: TransactionDto[] = []
  let page = 1

  while (page <= maxPages) {
    const pageData = await fetchTransactionsPage({
      page,
      pageSize: transactionsPageSize,
      signal,
    })
    const items = pageData.items

    allItems.push(...items)

    if (items.length === 0) {
      break
    }

    if (typeof pageData.totalPages === 'number' && pageData.totalPages > 0 && page >= pageData.totalPages) {
      break
    }

    if (typeof pageData.totalCount === 'number' && pageData.totalCount > 0 && allItems.length >= pageData.totalCount) {
      break
    }

    if (items.length < transactionsPageSize) {
      break
    }

    page += 1
  }

  return allItems
}

export function useCategoriesTableData(): UseCategoriesTableDataResult {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [draftFilters, setDraftFilters] = useState<CategoryFilterDraft>(emptyDraftFilters)
  const [appliedFilters, setAppliedFilters] = useState<CategoryFilters>({})

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: 5 * 60 * 1000,
  })
  const transactionsQuery = useQuery({
    queryKey: ['transactions', 'all'],
    queryFn: ({ signal }) => fetchAllTransactions(signal),
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (request: CategoryCreateRequest) => createCategory(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
        refetchType: 'active',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: CategoryUpdateRequest }) => updateCategory(id, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
        refetchType: 'active',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
        refetchType: 'active',
      })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (ids: string[]) => archiveCategories(ids),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
        refetchType: 'active',
      })
      await queryClient.invalidateQueries({
        queryKey: ['transactions'],
        refetchType: 'active',
      })

      setPage((current) => {
        const nextTotalCount = Math.max(0, totalCount - variables.length)
        const maxPage = Math.max(1, Math.ceil(nextTotalCount / pageSize))
        return Math.min(current, maxPage)
      })
    },
  })

  const rawCategories = categoriesQuery.data ?? emptyCategories
  const filteredCategories = useMemo(() => {
    const searchTerm = appliedFilters.searchTerm

    return rawCategories.filter((category) => {
      if (!searchTerm) {
        return true
      }

      return category.name.toLocaleLowerCase().includes(searchTerm)
    })
  }, [appliedFilters.searchTerm, rawCategories])

  const totalCount = filteredCategories.length
  const rawTransactions = transactionsQuery.data ?? emptyTransactions
  const spentByCategoryId = useMemo(() => {
    const totals: Record<string, number> = {}

    rawTransactions.forEach((transaction) => {
      totals[transaction.categoryId] = (totals[transaction.categoryId] ?? 0) + transaction.amount
    })

    return totals
  }, [rawTransactions])

  const items = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return filteredCategories.slice(start, end)
  }, [filteredCategories, page, pageSize])

  const error =
    toErrorMessage(categoriesQuery.error, t('errors.categoriesLoad')) ??
    toErrorMessage(transactionsQuery.error, t('errors.transactionsLoad'))
  const isLoading = (categoriesQuery.isPending && !categoriesQuery.data) || (transactionsQuery.isPending && !transactionsQuery.data)

  function onPageChange(nextPage: number, nextPageSize: number) {
    if (nextPageSize !== pageSize) {
      setPage(1)
      setPageSize(nextPageSize)
      return
    }

    setPage(nextPage)
  }

  function onDraftFilterChange(next: CategoryFilterDraft) {
    setDraftFilters(next)
  }

  function onApplyFilters(next: CategoryFilterDraft = draftFilters) {
    setAppliedFilters(normalizeDraftFilters(next))
    setPage(1)
  }

  function onResetFilters() {
    setDraftFilters(emptyDraftFilters)
    setAppliedFilters({})
    setPage(1)
  }

  async function onCreateCategory(request: CategoryCreateRequest) {
    await createMutation.mutateAsync(request)
    setPage(1)
  }

  async function onUpdateCategory(id: string, request: CategoryUpdateRequest) {
    await updateMutation.mutateAsync({ id, request })
  }

  async function onDeleteCategory(id: string) {
    await deleteMutation.mutateAsync(id)
    setPage((current) => {
      const nextTotalCount = Math.max(0, totalCount - 1)
      const maxPage = Math.max(1, Math.ceil(nextTotalCount / pageSize))
      return Math.min(current, maxPage)
    })
  }

  async function onArchiveCategories(ids: string[]) {
    if (ids.length === 0) {
      return
    }

    await archiveMutation.mutateAsync(ids)
  }

  return {
    items,
    spentByCategoryId,
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
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onArchiveCategories,
    isCreatingCategory: createMutation.isPending,
    isUpdatingCategory: updateMutation.isPending,
    isDeletingCategory: deleteMutation.isPending,
    isArchivingCategory: archiveMutation.isPending,
  }
}
