import { getJson } from './http'
import type { TransactionDto } from '../types/transaction'

export function fetchTransactions(signal?: AbortSignal): Promise<TransactionDto[]> {
  return getJson<TransactionDto[]>('/api/transactions', { signal })
}
