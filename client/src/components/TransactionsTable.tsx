import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TransactionFilterDraft } from '../hooks/useTransactionsTableData'
import type { AccountDto } from '../types/account'
import type { CategoryDto } from '../types/category'
import type { TransactionUpdateRequest } from '../types/transaction'

export type TransactionItem = {
  id: string
  accountId: string
  categoryId: string
  note: string
  account: string
  category: string
  bookedOn: string
  quantity: number
  merchant: string
  merchantValue?: string
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
  onUpdateTransaction: (id: string, request: TransactionUpdateRequest) => Promise<void>
  onDeleteTransaction: (id: string) => Promise<void>
  isUpdatingTransaction?: boolean
  isDeletingTransaction?: boolean
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

type EditFormValues = {
  note: string
  accountId: string
  categoryId: string
  bookedOn: dayjs.Dayjs
  amount: number
  merchant?: string
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
  onUpdateTransaction,
  onDeleteTransaction,
  isUpdatingTransaction = false,
  isDeletingTransaction = false,
}: TransactionsTableProps) {
  const { t, i18n } = useTranslation()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [editForm] = Form.useForm<EditFormValues>()
  const [openPopup, setOpenPopup] = useState(createClosedPopupState)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionItem | null>(null)
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null)
  const locale = i18n.resolvedLanguage === 'de' ? 'de-DE' : 'en-US'
  const dateInputFormat = locale === 'de-DE' ? 'DD.MM.YYYY' : 'MM/DD/YYYY'

  const hasOpenPopup = useMemo(() => Object.values(openPopup).some(Boolean), [openPopup])
  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: account.id,
        label: `${account.name} (${account.currencyCode})`,
      })),
    [accounts],
  )
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
                aria-label={t('transactions.actions.edit')}
                onClick={(event) => {
                  event.stopPropagation()
                  setEditingTransaction(record)
                  editForm.setFieldsValue({
                    note: record.note,
                    accountId: record.accountId,
                    categoryId: record.categoryId,
                    bookedOn: dayjs(record.bookedOn),
                    amount: record.quantity,
                    merchant: record.merchantValue,
                  })
                }}
                disabled={isDeletingTransaction}
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                aria-label={t('transactions.actions.delete')}
                onClick={(event) => {
                  event.stopPropagation()
                  setDeletingTransaction(record)
                }}
                disabled={isDeletingTransaction}
              />
            </Space>
          )
        },
      },
    ],
    [editForm, isDeletingTransaction, locale, selectedRowId, t],
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

  function closeEditModal() {
    setEditingTransaction(null)
    editForm.resetFields()
  }

  async function onEditSubmit(values: EditFormValues) {
    if (!editingTransaction) {
      return
    }

    closeEditModal()

    try {
      await onUpdateTransaction(editingTransaction.id, {
        accountId: values.accountId,
        categoryId: values.categoryId,
        bookedOn: values.bookedOn.format('YYYY-MM-DD'),
        amount: values.amount,
        note: values.note.trim(),
        merchant: values.merchant?.trim() ? values.merchant.trim() : null,
      })
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.transactionUpdate'))
    }
  }

  function closeDeleteModal() {
    if (isDeletingTransaction) {
      return
    }

    setDeletingTransaction(null)
  }

  async function onDeleteConfirm() {
    if (!deletingTransaction) {
      return
    }

    const transactionId = deletingTransaction.id
    setDeletingTransaction(null)

    try {
      await onDeleteTransaction(transactionId)
      setDeleteSuccessMessage(t('transactions.delete.success'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.transactionDelete'))
    }
  }

  useEffect(() => {
    if (!deleteSuccessMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setDeleteSuccessMessage(null)
    }, 5000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [deleteSuccessMessage])

  return (
    <Card className={cardClassName} title={cardTitle} variant="borderless">
      {messageContextHolder}
      {deleteSuccessMessage && (
        <Alert
          type="success"
          showIcon
          closable
          className="transactions-success-alert"
          message={deleteSuccessMessage}
          onClose={() => setDeleteSuccessMessage(null)}
        />
      )}
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

      <Modal
        open={editingTransaction !== null}
        wrapClassName="transactions-edit-modal"
        title={t('transactions.edit.title')}
        okText={t('transactions.edit.save')}
        cancelText={t('transactions.edit.cancel')}
        onOk={() => {
          void editForm.submit()
        }}
        onCancel={closeEditModal}
        destroyOnClose
        confirmLoading={isUpdatingTransaction}
        maskClosable={!isUpdatingTransaction}
      >
        <Form<EditFormValues>
          form={editForm}
          layout="vertical"
          onFinish={(values) => void onEditSubmit(values)}
        >
          <Form.Item name="note" label={t('transactions.columns.note')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="accountId" label={t('transactions.columns.account')} rules={[{ required: true }]}>
            <Select options={accountOptions} />
          </Form.Item>
          <Form.Item name="categoryId" label={t('transactions.columns.category')} rules={[{ required: true }]}>
            <Select options={categories.map((category) => ({ value: category.id, label: category.name }))} />
          </Form.Item>
          <Form.Item name="bookedOn" label={t('transactions.columns.bookedOn')} rules={[{ required: true }]}>
            <DatePicker format={dateInputFormat} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="amount" label={t('transactions.columns.amount')} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="merchant" label={t('transactions.columns.merchant')}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={deletingTransaction !== null}
        centered
        title={t('transactions.delete.confirmTitle')}
        okText={t('transactions.delete.confirm')}
        cancelText={t('transactions.delete.cancel')}
        onOk={() => {
          void onDeleteConfirm()
        }}
        onCancel={closeDeleteModal}
        confirmLoading={isDeletingTransaction}
        maskClosable={!isDeletingTransaction}
      >
        {deletingTransaction && (
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t('transactions.delete.confirmDescription')}{' '}
            (
            {deletingTransaction.note}, {deletingTransaction.account},{' '}
            {formatCurrency(Math.abs(deletingTransaction.quantity), locale, deletingTransaction.currencyCode ?? 'EUR')}
            )
          </Typography.Paragraph>
        )}
      </Modal>
    </Card>
  )
}
