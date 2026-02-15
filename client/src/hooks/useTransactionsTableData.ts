import { useEffect, useState } from 'react'
import { fetchAccounts } from '../api/accountsApi'
import { fetchCategories } from '../api/categoriesApi'
import { fetchTransactionsPage } from '../api/transactionsApi'
import type { TransactionItem } from '../components/TransactionsTable'
import type { AccountDto } from '../types/account'
import type { CategoryDto } from '../types/category'

type UseTransactionsTableDataResult = {
  items: TransactionItem[]
  isLoading: boolean
  error: string | null
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number, pageSize: number) => void
}

export function useTransactionsTableData(): UseTransactionsTableDataResult {
  const [items, setItems] = useState<TransactionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accountsById, setAccountsById] = useState<Map<string, AccountDto> | null>(null)
  const [categoriesById, setCategoriesById] = useState<Map<string, CategoryDto> | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadReferenceData() {
      try {
        const [accounts, categories] = await Promise.all([fetchAccounts(controller.signal), fetchCategories(controller.signal)])
        setAccountsById(new Map(accounts.map((account) => [account.id, account])))
        setCategoriesById(new Map(categories.map((category) => [category.id, category])))
      } catch (loadError) {
        if (controller.signal.aborted) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Transaktionen konnten nicht geladen werden.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadReferenceData()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (!accountsById || !categoriesById) {
      return
    }

    const localAccountsById = accountsById
    const localCategoriesById = categoriesById
    const controller = new AbortController()

    async function loadTransactionsPage() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetchTransactionsPage({
          page,
          pageSize,
          signal: controller.signal,
        })

        const mappedItems: TransactionItem[] = response.items.map((transaction) => {
          const account = localAccountsById.get(transaction.accountId)
          const category = localCategoriesById.get(transaction.categoryId)

          return {
            id: transaction.id,
            note: transaction.note,
            account: account?.name ?? '(Unbekanntes Konto)',
            category: category?.name ?? '(Unbekannte Kategorie)',
            bookedOn: transaction.bookedOn,
            quantity: transaction.amount,
            merchant: transaction.merchant?.trim() ? transaction.merchant : '-',
            currencyCode: account?.currencyCode ?? 'EUR',
          }
        })

        setItems(mappedItems)
        setTotalCount(response.totalCount)
      } catch (loadError) {
        if (controller.signal.aborted) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Transaktionen konnten nicht geladen werden.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadTransactionsPage()

    return () => {
      controller.abort()
    }
  }, [accountsById, categoriesById, page, pageSize])

  function onPageChange(nextPage: number, nextPageSize: number) {
    if (nextPageSize !== pageSize) {
      setPage(1)
      setPageSize(nextPageSize)
      return
    }

    setPage(nextPage)
  }

  return {
    items,
    isLoading,
    error,
    page,
    pageSize,
    totalCount,
    onPageChange,
  }
}
