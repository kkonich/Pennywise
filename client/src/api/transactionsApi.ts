import { getJson } from './http'
import type { TransactionDto, TransactionPageDto } from '../types/transaction'

type FetchTransactionsPageParams = {
  page: number
  pageSize: number
  signal?: AbortSignal
}

export function fetchTransactionsPage(params: FetchTransactionsPageParams): Promise<TransactionPageDto> {
  const query = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  })

  return getJson<TransactionPageDto | TransactionDto[]>(`/api/transactions?${query.toString()}`, {
    signal: params.signal,
  }).then((response) => normalizeTransactionsPageResponse(response, params.page, params.pageSize))
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
