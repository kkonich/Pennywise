import { Alert } from 'antd'
import { TransactionsTable } from '../components/TransactionsTable'
import { useTransactionsTableData } from '../hooks/useTransactionsTableData'

export function TransactionsPage() {
  const { items, isLoading, error } = useTransactionsTableData()

  return (
    <>
      {error && (
        <Alert
          type="error"
          showIcon
          message="Transaktionen konnten nicht geladen werden."
          description={error}
          style={{ marginBottom: 12 }}
        />
      )}
      <TransactionsTable items={items} isLoading={isLoading} />
    </>
  )
}
