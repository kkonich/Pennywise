import { getJson } from './http'
import type { AccountDto } from '../types/account'

export function fetchAccounts(signal?: AbortSignal): Promise<AccountDto[]> {
  return getJson<AccountDto[]>('/api/accounts', { signal })
}
