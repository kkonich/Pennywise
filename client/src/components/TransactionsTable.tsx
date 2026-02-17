import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TransactionFilterDraft } from '../hooks/useTransactionsTableData'
import type { AccountDto } from '../types/account'
import type { CategoryDto } from '../types/category'
import type { TransactionCreateRequest, TransactionType, TransactionUpdateRequest } from '../types/transaction'
import { UNCATEGORIZED_CATEGORY_ID } from '../constants/system'

export type TransactionItem = {
  id: string
  accountId: string
  categoryId: string
  note: string
  account: string
  category: string
  bookedOn: string
  quantity: number
  type: TransactionType
  merchant: string
  merchantValue?: string
}

type TransactionsTableProps = {
  items: TransactionItem[]
  currencyCode: string
  title?: string
  isLoading?: boolean
  page: number
  pageSize: number
  totalCount: number
  accounts: AccountDto[]
  categories: CategoryDto[]
  filters: TransactionFilterDraft
  onFiltersChange: (next: TransactionFilterDraft) => void
  onApplyFilters: (next?: TransactionFilterDraft) => void
  onResetFilters: () => void
  onPageChange: (page: number, pageSize: number) => void
  onCreateTransaction: (request: TransactionCreateRequest) => Promise<void>
  onUpdateTransaction: (id: string, request: TransactionUpdateRequest) => Promise<void>
  onDeleteTransaction: (id: string) => Promise<void>
  onArchiveTransactions: (ids: string[]) => Promise<void>
  isCreatingTransaction?: boolean
  isUpdatingTransaction?: boolean
  isDeletingTransaction?: boolean
  isArchivingTransaction?: boolean
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

type TransactionFormValues = {
  note: string
  accountId: string
  categoryId: string
  bookedOn: dayjs.Dayjs
  amount: number
  merchant?: string
  type: TransactionType
}

export function TransactionsTable({
  items,
  currencyCode,
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
  onCreateTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onArchiveTransactions,
  isCreatingTransaction = false,
  isUpdatingTransaction = false,
  isDeletingTransaction = false,
  isArchivingTransaction = false,
}: TransactionsTableProps) {
  const { t, i18n } = useTranslation()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [createForm] = Form.useForm<TransactionFormValues>()
  const [editForm] = Form.useForm<TransactionFormValues>()
  const [openPopup, setOpenPopup] = useState(createClosedPopupState)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionItem | null>(null)
  const locale = i18n.resolvedLanguage === 'de' ? 'de-DE' : 'en-US'
  const dateInputFormat = locale === 'de-DE' ? 'DD.MM.YYYY' : 'MM/DD/YYYY'

  const hasOpenPopup = useMemo(() => Object.values(openPopup).some(Boolean), [openPopup])
  const accountOptions = useMemo(
    () => accounts.map((account) => ({ value: account.id, label: account.name })),
    [accounts],
  )
  const categoriesById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories])
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.id === UNCATEGORIZED_CATEGORY_ID ? t('categories.uncategorized') : category.name,
      })),
    [categories, t],
  )
  const cardTitle = title ?? t('transactions.titleLatest')
  const hasSelection = selectedRowKeys.length > 0
  const rowSelection: NonNullable<TableProps<TransactionItem>['rowSelection']> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys.map(String)),
  }
  const amountRules = useMemo(
    () => [
      { required: true },
      {
        validator: (_: unknown, value?: number) =>
          typeof value === 'number' && value !== 0
            ? Promise.resolve()
            : Promise.reject(new Error(t('transactions.validation.amountNonZero'))),
      },
    ],
    [t],
  )

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
        title: t('transactions.columns.type'),
        dataIndex: 'type',
        key: 'type',
        onFilter: (value, record) => record.type === (value as TransactionType),
        filterDropdown: (filterState) => {
          const selectedTypeKeys = filterState.selectedKeys.filter(
            (key): key is TransactionType => key === 'Expense' || key === 'Income',
          )

          function onTypeSelectionChange(typeKey: TransactionType, isChecked: boolean) {
            const nextSelectedTypeKeys = isChecked
              ? Array.from(new Set([...selectedTypeKeys, typeKey]))
              : selectedTypeKeys.filter((selectedTypeKey) => selectedTypeKey !== typeKey)

            filterState.setSelectedKeys(nextSelectedTypeKeys)
            filterState.confirm({ closeDropdown: false })
          }

          return (
            <Space orientation="vertical" size={8} style={{ padding: 8 }}>
              <Checkbox
                checked={selectedTypeKeys.includes('Expense')}
                onChange={(event) => {
                  onTypeSelectionChange('Expense', event.target.checked)
                }}
              >
                {t('transactions.type.expense')}
              </Checkbox>
              <Checkbox
                checked={selectedTypeKeys.includes('Income')}
                onChange={(event) => {
                  onTypeSelectionChange('Income', event.target.checked)
                }}
              >
                {t('transactions.type.income')}
              </Checkbox>
            </Space>
          )
        },
        render: (value: TransactionType) => (
          <Tag
            className={
              value === 'Income'
                ? 'transaction-type-tag transaction-type-tag-income'
                : 'transaction-type-tag transaction-type-tag-expense'
            }
          >
            {t(`transactions.type.${value.toLowerCase() as 'income' | 'expense'}`)}
          </Tag>
        ),
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
          const isIncome = record.type === 'Income'
          const prefix = isIncome ? '+' : '-'
          const amountClassName = isIncome
            ? 'transaction-amount transaction-amount-positive'
            : 'transaction-amount transaction-amount-negative'
          return (
            <Typography.Text strong className={amountClassName}>
              {prefix}
              {formatCurrency(absValue, locale, currencyCode)}
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
                    type: record.type,
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
    [currencyCode, editForm, isDeletingTransaction, locale, selectedRowId, t],
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

  function openCreateModal() {
    const initialAccountId = accounts[0]?.id
    const initialCategoryId = categories[0]?.id
    const initialType = initialCategoryId ? categoriesById.get(initialCategoryId)?.type ?? 'Expense' : 'Expense'

    createForm.setFieldsValue({
      note: '',
      accountId: initialAccountId,
      categoryId: initialCategoryId,
      type: initialType,
      bookedOn: dayjs(),
      merchant: undefined,
    })
    setIsCreateModalOpen(true)
  }

  function closeCreateModal() {
    if (isCreatingTransaction) {
      return
    }

    setIsCreateModalOpen(false)
    createForm.resetFields()
  }

  async function onCreateSubmit(values: TransactionFormValues) {
    try {
      await onCreateTransaction({
        accountId: values.accountId,
        categoryId: values.categoryId,
        type: values.type,
        bookedOn: values.bookedOn.format('YYYY-MM-DD'),
        amount: values.amount,
        note: values.note.trim(),
        merchant: values.merchant?.trim() ? values.merchant.trim() : null,
      })
      setIsCreateModalOpen(false)
      createForm.resetFields()
      messageApi.success(t('transactions.create.success'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.transactionCreate'))
    }
  }

  async function onEditSubmit(values: TransactionFormValues) {
    if (!editingTransaction) {
      return
    }

    closeEditModal()

    try {
      await onUpdateTransaction(editingTransaction.id, {
        accountId: values.accountId,
        categoryId: values.categoryId,
        type: values.type,
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
      messageApi.success(t('transactions.delete.success'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.transactionDelete'))
    }
  }

  async function onArchiveSelected() {
    if (selectedRowKeys.length === 0) {
      return
    }

    try {
      await onArchiveTransactions(selectedRowKeys.map(String))
      setSelectedRowKeys([])
      messageApi.success(t('transactions.archive.selectedSuccess'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.transactionDelete'))
    }
  }

  return (
    <Card
      className={cardClassName}
      title={cardTitle}
      variant="borderless"
      extra={
        <Space>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => void onArchiveSelected()}
            disabled={!hasSelection}
            loading={isArchivingTransaction}
          >
            {t('transactions.archive.selected')}
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreateModal} disabled={isCreatingTransaction}>
            {t('transactions.create.open')}
          </Button>
        </Space>
      }
    >
      {messageContextHolder}
      <div className="transactions-filters" onKeyDown={onFiltersKeyDown}>
        <Space wrap size={[8, 8]}>
          <Input
            allowClear
            placeholder={t('transactions.filters.note')}
            value={filters.searchTerm}
            onChange={(event) => {
              const nextFilters = { ...filters, searchTerm: event.target.value || undefined }
              onFiltersChange(nextFilters)

              if (!nextFilters.searchTerm && filters.searchTerm) {
                onApplyFilters(nextFilters)
              }
            }}
          />
          <Select
            allowClear
            placeholder={t('transactions.filters.account')}
            value={filters.accountId}
            options={accounts.map((account) => ({ value: account.id, label: account.name }))}
            onChange={(value) => {
              const nextFilters = { ...filters, accountId: value }
              onFiltersChange(nextFilters)
              onApplyFilters(nextFilters)
            }}
            open={openPopup.account}
            onOpenChange={(isOpen) => setPopupOpen('account', isOpen)}
          />
          <Select
            allowClear
            placeholder={t('transactions.filters.category')}
            value={filters.categoryId}
            options={categoryOptions}
            onChange={(value) => {
              const nextFilters = { ...filters, categoryId: value }
              onFiltersChange(nextFilters)
              onApplyFilters(nextFilters)
            }}
            open={openPopup.category}
            onOpenChange={(isOpen) => setPopupOpen('category', isOpen)}
          />
          <Select<TransactionType>
            allowClear
            placeholder={t('transactions.filters.type')}
            value={filters.type}
            options={[
              { value: 'Expense', label: t('transactions.type.expense') },
              { value: 'Income', label: t('transactions.type.income') },
            ]}
            onChange={(value) => {
              const nextFilters = { ...filters, type: value ?? undefined }
              onFiltersChange(nextFilters)
              onApplyFilters(nextFilters)
            }}
          />
          <DatePicker
            placeholder={t('transactions.filters.bookedFrom')}
            value={filters.bookedFrom ? dayjs(filters.bookedFrom) : null}
            format={dateInputFormat}
            onChange={(date) => {
              const nextFilters = {
                ...filters,
                bookedFrom: date ? date.format('YYYY-MM-DD') : undefined,
              }
              onFiltersChange(nextFilters)
              onApplyFilters(nextFilters)
            }}
            open={openPopup.bookedFrom}
            onOpenChange={(isOpen) => setPopupOpen('bookedFrom', isOpen)}
          />
          <DatePicker
            placeholder={t('transactions.filters.bookedTo')}
            value={filters.bookedTo ? dayjs(filters.bookedTo) : null}
            format={dateInputFormat}
            onChange={(date) => {
              const nextFilters = {
                ...filters,
                bookedTo: date ? date.format('YYYY-MM-DD') : undefined,
              }
              onFiltersChange(nextFilters)
              onApplyFilters(nextFilters)
            }}
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
        rowSelection={rowSelection}
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
        destroyOnHidden
        confirmLoading={isUpdatingTransaction}
        mask={{ closable: !isUpdatingTransaction }}
      >
        <Form<TransactionFormValues>
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
            <Select
              options={categoryOptions}
              onChange={(value) => {
                const category = categoriesById.get(value)
                if (category) {
                  createForm.setFieldValue('type', category.type)
                }
              }}
            />
          </Form.Item>
          <Form.Item name="type" label={t('transactions.columns.type')} rules={[{ required: true }]}>
            <Select<TransactionType>
              options={[
                { value: 'Expense', label: t('transactions.type.expense') },
                { value: 'Income', label: t('transactions.type.income') },
              ]}
            />
          </Form.Item>
          <Form.Item name="bookedOn" label={t('transactions.columns.bookedOn')} rules={[{ required: true }]}>
            <DatePicker format={dateInputFormat} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="amount" label={t('transactions.columns.amount')} rules={amountRules}>
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
        mask={{ closable: !isDeletingTransaction }}
      >
        {deletingTransaction && (
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t('transactions.delete.confirmDescription')}{' '}
            (
            {deletingTransaction.note}, {deletingTransaction.account},{' '}
            {formatCurrency(Math.abs(deletingTransaction.quantity), locale, currencyCode)}
            )
          </Typography.Paragraph>
        )}
      </Modal>

      <Modal
        open={isCreateModalOpen}
        wrapClassName="transactions-edit-modal"
        title={t('transactions.create.title')}
        okText={t('transactions.create.save')}
        cancelText={t('transactions.create.cancel')}
        onOk={() => {
          void createForm.submit()
        }}
        onCancel={closeCreateModal}
        destroyOnHidden
        confirmLoading={isCreatingTransaction}
        mask={{ closable: !isCreatingTransaction }}
      >
        <Form<TransactionFormValues>
          form={createForm}
          layout="vertical"
          onFinish={(values) => void onCreateSubmit(values)}
        >
          <Form.Item name="note" label={t('transactions.columns.note')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="accountId" label={t('transactions.columns.account')} rules={[{ required: true }]}>
            <Select options={accountOptions} />
          </Form.Item>
          <Form.Item name="categoryId" label={t('transactions.columns.category')} rules={[{ required: true }]}>
            <Select
              options={categoryOptions}
              onChange={(value) => {
                const category = categoriesById.get(value)
                if (category) {
                  editForm.setFieldValue('type', category.type)
                }
              }}
            />
          </Form.Item>
          <Form.Item name="type" label={t('transactions.columns.type')} rules={[{ required: true }]}>
            <Select<TransactionType>
              options={[
                { value: 'Expense', label: t('transactions.type.expense') },
                { value: 'Income', label: t('transactions.type.income') },
              ]}
            />
          </Form.Item>
          <Form.Item name="bookedOn" label={t('transactions.columns.bookedOn')} rules={[{ required: true }]}>
            <DatePicker format={dateInputFormat} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="amount" label={t('transactions.columns.amount')} rules={amountRules}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="merchant" label={t('transactions.columns.merchant')}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
