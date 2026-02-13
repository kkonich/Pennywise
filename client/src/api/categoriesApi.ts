import { getJson } from './http'
import type { CategoryDto } from '../types/category'

export function fetchCategories(signal?: AbortSignal): Promise<CategoryDto[]> {
  return getJson<CategoryDto[]>('/api/categories', { signal })
}
