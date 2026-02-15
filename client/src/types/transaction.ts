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
