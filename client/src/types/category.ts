export type CategoryDto = {
  id: string
  name: string
  type: 'Expense' | 'Income'
}

export type CategoryCreateRequest = {
  name: string
  type: 'Expense' | 'Income'
}

export type CategoryUpdateRequest = CategoryCreateRequest
