export type TransactionType = 'Expense' | 'Income'

export type TransactionDto = {
  id: string
  accountId: string
  categoryId: string
  type: TransactionType
  bookedOn: string
  amount: number
  note: string
  merchant: string | null
}

export type TransactionPageDto = {
  items: TransactionDto[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export type TransactionFilters = {
  accountId?: string
  categoryId?: string
  type?: TransactionType
  bookedFrom?: string
  bookedTo?: string
  minAmount?: number
  maxAmount?: number
  searchTerm?: string
}

export type TransactionUpdateRequest = {
  accountId: string
  categoryId: string
  type?: TransactionType
  bookedOn: string
  amount: number
  note: string
  merchant: string | null
}

export type TransactionCreateRequest = TransactionUpdateRequest
