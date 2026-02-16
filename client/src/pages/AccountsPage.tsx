import { message } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AccountsTable } from '../components/AccountsTable'
import { useAccountsTableData } from '../hooks/useAccountsTableData'

export function AccountsPage() {
  const { t } = useTranslation()
  const [messageApi, messageContextHolder] = message.useMessage()
  const {
    items,
    accounts,
    isLoading,
    error,
    page,
    pageSize,
    totalCount,
    draftFilters,
    onDraftFilterChange,
    onApplyFilters,
    onResetFilters,
    onPageChange,
    onCreateAccount,
    onUpdateAccount,
    onDeleteAccount,
    isCreatingAccount,
    isUpdatingAccount,
    isDeletingAccount,
  } = useAccountsTableData()

  useEffect(() => {
    if (!error) {
      return
    }

    messageApi.error(`${t('errors.accountsLoad')} ${error}`)
  }, [error, messageApi, t])

  return (
    <>
      {messageContextHolder}
      <AccountsTable
        items={items}
        accounts={accounts}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        filters={draftFilters}
        onFiltersChange={onDraftFilterChange}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        onPageChange={onPageChange}
        onCreateAccount={onCreateAccount}
        onUpdateAccount={onUpdateAccount}
        onDeleteAccount={onDeleteAccount}
        isCreatingAccount={isCreatingAccount}
        isUpdatingAccount={isUpdatingAccount}
        isDeletingAccount={isDeletingAccount}
      />
    </>
  )
}
