import { deleteJson, getJson, postJson } from './http'

type DemoDataExistsResponse = {
  exists: boolean
}

export function fetchDemoDataExists(signal?: AbortSignal): Promise<DemoDataExistsResponse> {
  return getJson<DemoDataExistsResponse>('/api/demo-data/seed', { signal })
}

export function seedDemoData(): Promise<void> {
  return postJson<void>('/api/demo-data/seed', { body: {} })
}

export function clearDemoData(): Promise<void> {
  return deleteJson('/api/demo-data/seed')
}
