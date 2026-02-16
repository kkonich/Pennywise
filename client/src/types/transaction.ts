export type TransactionDto = {
  id: string
  accountId: string
  categoryId: string
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
  bookedFrom?: string
  bookedTo?: string
  minAmount?: number
  maxAmount?: number
  searchTerm?: string
}

export type TransactionUpdateRequest = {
  accountId: string
  categoryId: string
  bookedOn: string
  amount: number
  note: string
  merchant: string | null
}
