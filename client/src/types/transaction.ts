export type TransactionDto = {
  id: string
  accountId: string
  categoryId: string
  bookedOn: string
  amount: number
  note: string
  merchant: string | null
}
