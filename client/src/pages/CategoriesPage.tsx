import { message } from 'antd'
import { useEffect } from 'react'
import { CategoriesTable } from '../components/CategoriesTable'
import { useCategoriesTableData } from '../hooks/useCategoriesTableData'
import { useUserSettings } from '../hooks/useUserSettings'

export function CategoriesPage() {
  const [messageApi, messageContextHolder] = message.useMessage()
  const { settings } = useUserSettings()
  const {
    items,
    spentByCategoryId,
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
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    isCreatingCategory,
    isUpdatingCategory,
    isDeletingCategory,
  } = useCategoriesTableData()
  const currencyCode = settings?.currencyCode ?? 'EUR'

  useEffect(() => {
    if (!error) {
      return
    }

    messageApi.error(error)
  }, [error, messageApi])

  return (
    <>
      {messageContextHolder}
      <CategoriesTable
        items={items}
        spentByCategoryId={spentByCategoryId}
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
        onCreateCategory={onCreateCategory}
        onUpdateCategory={onUpdateCategory}
        onDeleteCategory={onDeleteCategory}
        isCreatingCategory={isCreatingCategory}
        isUpdatingCategory={isUpdatingCategory}
        isDeletingCategory={isDeletingCategory}
      />
    </>
  )
}
