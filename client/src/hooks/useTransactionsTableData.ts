import { useEffect, useState } from 'react'
import { fetchAccounts } from '../api/accountsApi'
import { fetchCategories } from '../api/categoriesApi'
import { fetchTransactions } from '../api/transactionsApi'
import type { TransactionItem } from '../components/TransactionsTable'

type UseTransactionsTableDataResult = {
  items: TransactionItem[]
  isLoading: boolean
  error: string | null
}

export function useTransactionsTableData(): UseTransactionsTableDataResult {
  const [items, setItems] = useState<TransactionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        const [transactions, accounts, categories] = await Promise.all([
          fetchTransactions(controller.signal),
          fetchAccounts(controller.signal),
          fetchCategories(controller.signal),
        ])

        const accountById = new Map(accounts.map((account) => [account.id, account]))
        const categoryById = new Map(categories.map((category) => [category.id, category]))

        const mappedItems: TransactionItem[] = transactions.map((transaction) => {
          const account = accountById.get(transaction.accountId)
          const category = categoryById.get(transaction.categoryId)

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

    void loadData()

    return () => {
      controller.abort()
    }
  }, [])

  return {
    items,
    isLoading,
    error,
  }
}
