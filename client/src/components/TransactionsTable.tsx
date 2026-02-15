import { Button, Card, DatePicker, Input, InputNumber, Pagination, Select, Space, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import type { AccountDto } from '../types/account'
import type { CategoryDto } from '../types/category'
import type { TransactionFilterDraft } from '../hooks/useTransactionsTableData'

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

function formatCurrency(value: number, currencyCode = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: currencyCode }).format(value)
}

const columns: TableColumnsType<TransactionItem> = [
  {
    title: 'Beschreibung',
    dataIndex: 'note',
    key: 'note',
    sorter: (a, b) => a.note.localeCompare(b.note, 'de-DE'),
  },
  {
    title: 'Konto',
    dataIndex: 'account',
    key: 'account',
    sorter: (a, b) => a.account.localeCompare(b.account, 'de-DE'),
  },
  {
    title: 'Kategorie',
    dataIndex: 'category',
    key: 'category',
    sorter: (a, b) => a.category.localeCompare(b.category, 'de-DE'),
  },
  {
    title: 'Buchungsdatum',
    dataIndex: 'bookedOn',
    key: 'bookedOn',
    sorter: (a, b) => new Date(a.bookedOn).getTime() - new Date(b.bookedOn).getTime(),
    render: (value: string) => new Date(value).toLocaleDateString('de-DE'),
  },
  {
    title: 'Betrag',
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
          {formatCurrency(absValue, record.currencyCode ?? 'EUR')}
        </Typography.Text>
      )
    },
  },
  {
    title: 'Transaktionspartner',
    dataIndex: 'merchant',
    key: 'merchant',
    sorter: (a, b) => a.merchant.localeCompare(b.merchant, 'de-DE'),
  },
]

export function TransactionsTable({
  items,
  title = 'Letzte Transaktionen',
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
  const [openPopup, setOpenPopup] = useState(createClosedPopupState)

  const hasOpenPopup = useMemo(() => Object.values(openPopup).some(Boolean), [openPopup])

  const cardClassName = hasOpenPopup ? 'transactions-table transactions-table-popup-open' : 'transactions-table'

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
    <Card className={cardClassName} title={title} variant="borderless">
      <div className="transactions-filters" onKeyDown={onFiltersKeyDown}>
        <Space wrap size={[8, 8]}>
          <Input
            allowClear
            placeholder="Beschreibung"
            value={filters.searchTerm}
            onChange={(event) => onFiltersChange({ ...filters, searchTerm: event.target.value || undefined })}
          />
          <Select
            allowClear
            placeholder="Konto"
            value={filters.accountId}
            options={accounts.map((account) => ({ value: account.id, label: account.name }))}
            onChange={(value) => onFiltersChange({ ...filters, accountId: value })}
            open={openPopup.account}
            onOpenChange={(isOpen) => setPopupOpen('account', isOpen)}
          />
          <Select
            allowClear
            placeholder="Kategorie"
            value={filters.categoryId}
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
            onChange={(value) => onFiltersChange({ ...filters, categoryId: value })}
            open={openPopup.category}
            onOpenChange={(isOpen) => setPopupOpen('category', isOpen)}
          />
          <DatePicker
            placeholder="Buchung von"
            value={filters.bookedFrom ? dayjs(filters.bookedFrom) : null}
            format="DD.MM.YYYY"
            onChange={(date) =>
              onFiltersChange({
                ...filters,
                bookedFrom: date ? date.format('YYYY-MM-DD') : undefined,
              })}
            open={openPopup.bookedFrom}
            onOpenChange={(isOpen) => setPopupOpen('bookedFrom', isOpen)}
          />
          <DatePicker
            placeholder="Buchung bis"
            value={filters.bookedTo ? dayjs(filters.bookedTo) : null}
            format="DD.MM.YYYY"
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
            placeholder="Betrag min"
            value={filters.minAmount ?? null}
            onChange={(value) => onFiltersChange({ ...filters, minAmount: value ?? undefined })}
          />
          <InputNumber<string>
            stringMode
            step="1"
            placeholder="Betrag max"
            value={filters.maxAmount ?? null}
            onChange={(value) => onFiltersChange({ ...filters, maxAmount: value ?? undefined })}
          />
          <Button
            onClick={() => {
              closeAllPopups()
              onApplyFilters()
            }}
          >
            Anwenden
          </Button>
          <Button
            onClick={() => {
              closeAllPopups()
              onResetFilters()
            }}
          >
            Zuruecksetzen
          </Button>
        </Space>
      </div>
      <Table<TransactionItem>
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={isLoading}
        pagination={false}
        size="middle"
        locale={{ emptyText: 'Keine Transaktionen vorhanden.' }}
      />
      <Pagination
        current={page}
        pageSize={pageSize}
        total={totalCount}
        onChange={onPageChange}
        showSizeChanger
        pageSizeOptions={['25', '50', '100']}
        showTotal={(total, range) => `${range[0]}-${range[1]} von ${total}`}
      />
    </Card>
  )
}
