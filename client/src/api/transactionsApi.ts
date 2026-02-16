import { deleteJson, getJson, postJson, putJson } from './http'
import type {
  TransactionCreateRequest,
  TransactionDto,
  TransactionFilters,
  TransactionPageDto,
  TransactionUpdateRequest,
} from '../types/transaction'

type FetchTransactionsPageParams = {
  page: number
  pageSize: number
  filters?: TransactionFilters
  signal?: AbortSignal
}

export function fetchTransactionsPage(params: FetchTransactionsPageParams): Promise<TransactionPageDto> {
  const query = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  })

  if (params.filters?.accountId) {
    query.set('accountId', params.filters.accountId)
  }

  if (params.filters?.categoryId) {
    query.set('categoryId', params.filters.categoryId)
  }

  if (params.filters?.bookedFrom) {
    query.set('bookedFrom', params.filters.bookedFrom)
  }

  if (params.filters?.bookedTo) {
    query.set('bookedTo', params.filters.bookedTo)
  }

  if (typeof params.filters?.minAmount === 'number') {
    query.set('minAmount', params.filters.minAmount.toString())
  }

  if (typeof params.filters?.maxAmount === 'number') {
    query.set('maxAmount', params.filters.maxAmount.toString())
  }

  if (params.filters?.searchTerm) {
    query.set('searchTerm', params.filters.searchTerm)
  }

  return getJson<TransactionPageDto | TransactionDto[]>(`/api/transactions?${query.toString()}`, {
    signal: params.signal,
  }).then((response) => normalizeTransactionsPageResponse(response, params.page, params.pageSize))
}

export function updateTransaction(id: string, request: TransactionUpdateRequest): Promise<void> {
  return putJson(`/api/transactions/${id}`, { body: request })
}

export function createTransaction(request: TransactionCreateRequest): Promise<TransactionDto> {
  return postJson<TransactionDto>('/api/transactions', { body: request })
}

export function deleteTransaction(id: string): Promise<void> {
  return deleteJson(`/api/transactions/${id}`)
}

function normalizeTransactionsPageResponse(
  response: TransactionPageDto | TransactionDto[],
  page: number,
  pageSize: number,
): TransactionPageDto {
  if (Array.isArray(response)) {
    const totalCount = response.length
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      items: response.slice(start, end),
      totalCount,
      page,
      pageSize,
      totalPages,
    }
  }

  return response
}
