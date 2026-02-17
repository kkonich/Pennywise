export type AccountDto = {
  id: string
  name: string
  balance: number
  createdAt: string
}

export type AccountCreateRequest = {
  name: string
  balance: number
}

export type AccountUpdateRequest = AccountCreateRequest
