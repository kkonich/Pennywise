import { deleteJson, getJson, postJson, putJson } from './http'
import type { CategoryCreateRequest, CategoryDto, CategoryUpdateRequest } from '../types/category'

export function fetchCategories(signal?: AbortSignal): Promise<CategoryDto[]> {
  return getJson<CategoryDto[]>('/api/categories', { signal })
}

export function createCategory(request: CategoryCreateRequest): Promise<CategoryDto> {
  return postJson<CategoryDto>('/api/categories', { body: request })
}

export function updateCategory(id: string, request: CategoryUpdateRequest): Promise<void> {
  return putJson(`/api/categories/${id}`, { body: request })
}

export function deleteCategory(id: string): Promise<void> {
  return deleteJson(`/api/categories/${id}`)
}
