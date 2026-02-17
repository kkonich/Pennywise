import { message } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TransactionsTable } from '../components/TransactionsTable'
import { useTransactionsTableData } from '../hooks/useTransactionsTableData'
import { useUserSettings } from '../hooks/useUserSettings'

export function TransactionsPage() {
  const { t } = useTranslation()
  const [messageApi, messageContextHolder] = message.useMessage()
  const { settings, error: settingsError } = useUserSettings()
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
    onCreateTransaction,
    onUpdateTransaction,
    onDeleteTransaction,
    isCreatingTransaction,
    isUpdatingTransaction,
    isDeletingTransaction,
  } = useTransactionsTableData()

  useEffect(() => {
    if (!error) {
      return
    }

    messageApi.error(`${t('errors.transactionsLoad')} ${error}`)
  }, [error, messageApi, t])

  useEffect(() => {
    if (!settingsError) {
      return
    }

    messageApi.error(`${t('errors.settingsLoad')} ${settingsError}`)
  }, [messageApi, settingsError, t])

  const currencyCode = settings?.currencyCode ?? 'EUR'

  return (
    <>
      {messageContextHolder}
      <TransactionsTable
        items={items}
        currencyCode={currencyCode}
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
        onCreateTransaction={onCreateTransaction}
        onUpdateTransaction={onUpdateTransaction}
        onDeleteTransaction={onDeleteTransaction}
        isCreatingTransaction={isCreatingTransaction}
        isUpdatingTransaction={isUpdatingTransaction}
        isDeletingTransaction={isDeletingTransaction}
      />
    </>
  )
}
