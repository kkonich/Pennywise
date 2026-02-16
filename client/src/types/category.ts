export type CategoryDto = {
  id: string
  name: string
}

export type CategoryCreateRequest = {
  name: string
}

export type CategoryUpdateRequest = CategoryCreateRequest
