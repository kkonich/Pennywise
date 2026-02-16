import { Alert } from 'antd'
import { useTranslation } from 'react-i18next'
import { TransactionsTable } from '../components/TransactionsTable'
import { useTransactionsTableData } from '../hooks/useTransactionsTableData'

export function TransactionsPage() {
  const { t } = useTranslation()
  const {
    items,
    isLoading,
    error,
    page,
    pageSize,
    totalCount,
    accounts,
    categories,
    draftFilters,
    onDraftFilterChange,
    onApplyFilters,
    onResetFilters,
    onPageChange,
    onUpdateTransaction,
    isUpdatingTransaction,
  } = useTransactionsTableData()

  return (
    <>
      {error && (
        <Alert
          type="error"
          showIcon
          className="transactions-error-alert"
          message={t('errors.transactionsLoad')}
          description={error}
        />
      )}
      <TransactionsTable
        items={items}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        accounts={accounts}
        categories={categories}
        filters={draftFilters}
        onFiltersChange={onDraftFilterChange}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        onPageChange={onPageChange}
        onUpdateTransaction={onUpdateTransaction}
        isUpdatingTransaction={isUpdatingTransaction}
      />
    </>
  )
}
