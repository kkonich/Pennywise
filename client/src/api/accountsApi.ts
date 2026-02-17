import { deleteJson, getJson, postJson, putJson } from './http'
import type { AccountCreateRequest, AccountDto, AccountUpdateRequest } from '../types/account'

export function fetchAccounts(signal?: AbortSignal): Promise<AccountDto[]> {
  return getJson<AccountDto[]>('/api/accounts', { signal })
}

export function createAccount(request: AccountCreateRequest): Promise<AccountDto> {
  return postJson<AccountDto>('/api/accounts', { body: request })
}

export function updateAccount(id: string, request: AccountUpdateRequest): Promise<void> {
  return putJson(`/api/accounts/${id}`, { body: request })
}

export function deleteAccount(id: string): Promise<void> {
  return deleteJson(`/api/accounts/${id}`)
}

export function archiveAccounts(ids: string[]): Promise<void> {
  return postJson('/api/accounts/archive', { body: { ids } })
}
