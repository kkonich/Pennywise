import { getJson, putJson } from './http'
import type { UserSettingsDto, UserSettingsUpdateRequest } from '../types/settings'

export function fetchUserSettings(signal?: AbortSignal): Promise<UserSettingsDto> {
  return getJson<UserSettingsDto>('/api/settings', { signal })
}

export function updateUserSettings(request: UserSettingsUpdateRequest): Promise<void> {
  return putJson('/api/settings', { body: request })
}
