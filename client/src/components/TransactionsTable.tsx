import { Button, Card, DatePicker, Input, InputNumber, Pagination, Select, Space, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TransactionFilterDraft } from '../hooks/useTransactionsTableData'
import type { AccountDto } from '../types/account'
import type { CategoryDto } from '../types/category'

export type TransactionItem = {
  id: string
  note: string
  account: string
  category: string
  bookedOn: string
  quantity: number
  merchant: string
  currencyCode?: string
}

type TransactionsTableProps = {
  items: TransactionItem[]
  title?: string
  isLoading?: boolean
  page: number
  pageSize: number
  totalCount: number
  accounts: AccountDto[]
  categories: CategoryDto[]
  filters: TransactionFilterDraft
  onFiltersChange: (next: TransactionFilterDraft) => void
  onApplyFilters: () => void
  onResetFilters: () => void
  onPageChange: (page: number, pageSize: number) => void
}

type OpenPopupState = {
  account: boolean
  category: boolean
  bookedFrom: boolean
  bookedTo: boolean
}

function createClosedPopupState(): OpenPopupState {
  return {
    account: false,
    category: false,
    bookedFrom: false,
    bookedTo: false,
  }
}

function formatCurrency(value: number, locale: string, currencyCode = 'EUR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(value)
}

export function TransactionsTable({
  items,
  title,
  isLoading = false,
  page,
  pageSize,
  totalCount,
  accounts,
  categories,
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  onPageChange,
}: TransactionsTableProps) {
  const { t, i18n } = useTranslation()
  const [openPopup, setOpenPopup] = useState(createClosedPopupState)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const locale = i18n.resolvedLanguage === 'de' ? 'de-DE' : 'en-US'
  const dateInputFormat = locale === 'de-DE' ? 'DD.MM.YYYY' : 'MM/DD/YYYY'

  const hasOpenPopup = useMemo(() => Object.values(openPopup).some(Boolean), [openPopup])
  const cardTitle = title ?? t('transactions.titleLatest')

  const cardClassName = hasOpenPopup ? 'transactions-table transactions-table-popup-open' : 'transactions-table'
  const columns: TableColumnsType<TransactionItem> = useMemo(
    () => [
      {
        title: t('transactions.columns.note'),
        dataIndex: 'note',
        key: 'note',
        sorter: (a, b) => a.note.localeCompare(b.note, locale),
      },
      {
        title: t('transactions.columns.account'),
        dataIndex: 'account',
        key: 'account',
        sorter: (a, b) => a.account.localeCompare(b.account, locale),
      },
      {
        title: t('transactions.columns.category'),
        dataIndex: 'category',
        key: 'category',
        sorter: (a, b) => a.category.localeCompare(b.category, locale),
      },
      {
        title: t('transactions.columns.bookedOn'),
        dataIndex: 'bookedOn',
        key: 'bookedOn',
        sorter: (a, b) => new Date(a.bookedOn).getTime() - new Date(b.bookedOn).getTime(),
        render: (value: string) => new Date(value).toLocaleDateString(locale),
      },
      {
        title: t('transactions.columns.amount'),
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'right',
        sorter: (a, b) => a.quantity - b.quantity,
        render: (value: number, record: TransactionItem) => {
          const absValue = Math.abs(value)
          const prefix = value > 0 ? '+' : value < 0 ? '-' : ''
          const amountClassName =
            value > 0
              ? 'transaction-amount transaction-amount-positive'
              : value < 0
                ? 'transaction-amount transaction-amount-negative'
                : 'transaction-amount'
          return (
            <Typography.Text strong className={amountClassName}>
              {prefix}
              {formatCurrency(absValue, locale, record.currencyCode ?? 'EUR')}
            </Typography.Text>
          )
        },
      },
      {
        title: t('transactions.columns.merchant'),
        dataIndex: 'merchant',
        key: 'merchant',
        sorter: (a, b) => a.merchant.localeCompare(b.merchant, locale),
      },
      {
        title: '',
        key: 'actions',
        align: 'right',
        width: 96,
        render: (_value, record) => {
          const isSelected = record.id === selectedRowId
          return (
            <Space size={4} className={isSelected ? 'transactions-row-actions is-visible' : 'transactions-row-actions'}>
              <Button
                type="text"
                icon={<EditOutlined />}
                aria-label="Edit transaction"
                onClick={(event) => {
                  event.stopPropagation()
                }}
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                aria-label="Delete transaction"
                onClick={(event) => {
                  event.stopPropagation()
                }}
              />
            </Space>
          )
        },
      },
    ],
    [locale, selectedRowId, t],
  )

  function closeAllPopups() {
    setOpenPopup(createClosedPopupState())
  }

  function setPopupOpen(key: keyof OpenPopupState, isOpen: boolean) {
    setOpenPopup((prev) => ({ ...prev, [key]: isOpen }))
  }

  function onFiltersKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement

    if (event.key === 'Escape' && hasOpenPopup) {
      event.preventDefault()
      event.stopPropagation()
      closeAllPopups()
      target.blur()
      return
    }

    if (event.key === 'Enter' && !hasOpenPopup && !target.closest('button')) {
      event.preventDefault()
      onApplyFilters()
    }
  }

  return (
    <Card className={cardClassName} title={cardTitle} variant="borderless">
      <div className="transactions-filters" onKeyDown={onFiltersKeyDown}>
        <Space wrap size={[8, 8]}>
          <Input
            allowClear
            placeholder={t('transactions.filters.note')}
            value={filters.searchTerm}
            onChange={(event) => onFiltersChange({ ...filters, searchTerm: event.target.value || undefined })}
          />
          <Select
            allowClear
            placeholder={t('transactions.filters.account')}
            value={filters.accountId}
            options={accounts.map((account) => ({ value: account.id, label: account.name }))}
            onChange={(value) => onFiltersChange({ ...filters, accountId: value })}
            open={openPopup.account}
            onOpenChange={(isOpen) => setPopupOpen('account', isOpen)}
          />
          <Select
            allowClear
            placeholder={t('transactions.filters.category')}
            value={filters.categoryId}
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
            onChange={(value) => onFiltersChange({ ...filters, categoryId: value })}
            open={openPopup.category}
            onOpenChange={(isOpen) => setPopupOpen('category', isOpen)}
          />
          <DatePicker
            placeholder={t('transactions.filters.bookedFrom')}
            value={filters.bookedFrom ? dayjs(filters.bookedFrom) : null}
            format={dateInputFormat}
            onChange={(date) =>
              onFiltersChange({
                ...filters,
                bookedFrom: date ? date.format('YYYY-MM-DD') : undefined,
              })}
            open={openPopup.bookedFrom}
            onOpenChange={(isOpen) => setPopupOpen('bookedFrom', isOpen)}
          />
          <DatePicker
            placeholder={t('transactions.filters.bookedTo')}
            value={filters.bookedTo ? dayjs(filters.bookedTo) : null}
            format={dateInputFormat}
            onChange={(date) =>
              onFiltersChange({
                ...filters,
                bookedTo: date ? date.format('YYYY-MM-DD') : undefined,
              })}
            open={openPopup.bookedTo}
            onOpenChange={(isOpen) => setPopupOpen('bookedTo', isOpen)}
          />
          <InputNumber<string>
            stringMode
            step="1"
            placeholder={t('transactions.filters.minAmount')}
            value={filters.minAmount ?? null}
            onChange={(value) => onFiltersChange({ ...filters, minAmount: value ?? undefined })}
          />
          <InputNumber<string>
            stringMode
            step="1"
            placeholder={t('transactions.filters.maxAmount')}
            value={filters.maxAmount ?? null}
            onChange={(value) => onFiltersChange({ ...filters, maxAmount: value ?? undefined })}
          />
          <Button
            onClick={() => {
              closeAllPopups()
              onApplyFilters()
            }}
          >
            {t('transactions.filters.apply')}
          </Button>
          <Button
            onClick={() => {
              closeAllPopups()
              onResetFilters()
            }}
          >
            {t('transactions.filters.reset')}
          </Button>
        </Space>
      </div>
      <Table<TransactionItem>
        rowKey="id"
        columns={columns}
        showSorterTooltip={{ target: 'sorter-icon', mouseEnterDelay: 0.5 }}
        dataSource={items}
        rowClassName={(record) => (record.id === selectedRowId ? 'transactions-row-selected' : '')}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRowId((prev) => (prev === record.id ? null : record.id))
          },
        })}
        loading={isLoading}
        pagination={false}
        size="middle"
        locale={{ emptyText: t('transactions.empty') }}
      />
      <Pagination
        current={page}
        pageSize={pageSize}
        total={totalCount}
        onChange={onPageChange}
        showSizeChanger
        pageSizeOptions={['25', '50', '100']}
        showTotal={(total, range) =>
          t('transactions.pagination.rangeOfTotal', { start: range[0], end: range[1], total })
        }
      />
    </Card>
  )
}
