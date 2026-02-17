import { message } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AccountsTable } from '../components/AccountsTable'
import { useAccountsTableData } from '../hooks/useAccountsTableData'
import { useUserSettings } from '../hooks/useUserSettings'

export function AccountsPage() {
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
      <AccountsTable
        items={items}
        currencyCode={currencyCode}
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
