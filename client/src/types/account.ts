export type AccountDto = {
  id: string
  name: string
  currencyCode: string
  balance: number
  createdAt: string
}

export type AccountCreateRequest = {
  name: string
  currencyCode: string
  balance: number
}

export type AccountUpdateRequest = AccountCreateRequest
