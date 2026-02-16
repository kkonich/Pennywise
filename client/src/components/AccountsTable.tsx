import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
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
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMMON_CURRENCIES } from '../constants/currencies'
import type { AccountFilterDraft } from '../hooks/useAccountsTableData'
import type { AccountCreateRequest, AccountDto, AccountUpdateRequest } from '../types/account'

type AccountsTableProps = {
  items: AccountDto[]
  accounts: AccountDto[]
  title?: string
  isLoading?: boolean
  page: number
  pageSize: number
  totalCount: number
  filters: AccountFilterDraft
  onFiltersChange: (next: AccountFilterDraft) => void
  onApplyFilters: () => void
  onResetFilters: () => void
  onPageChange: (page: number, pageSize: number) => void
  onCreateAccount: (request: AccountCreateRequest) => Promise<void>
  onUpdateAccount: (id: string, request: AccountUpdateRequest) => Promise<void>
  onDeleteAccount: (id: string) => Promise<void>
  isCreatingAccount?: boolean
  isUpdatingAccount?: boolean
  isDeletingAccount?: boolean
}

type OpenPopupState = {
  currency: boolean
}

type AccountFormValues = {
  name: string
  currencyCode: string
  balance: number
}

function createClosedPopupState(): OpenPopupState {
  return {
    currency: false,
  }
}

function formatCurrency(value: number, locale: string, currencyCode: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(value)
}

function normalizeCurrencyCode(value: string): string {
  return value.trim().toUpperCase()
}

export function AccountsTable({
  items,
  accounts,
  title,
  isLoading = false,
  page,
  pageSize,
  totalCount,
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  onPageChange,
  onCreateAccount,
  onUpdateAccount,
  onDeleteAccount,
  isCreatingAccount = false,
  isUpdatingAccount = false,
  isDeletingAccount = false,
}: AccountsTableProps) {
  const { t, i18n } = useTranslation()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [createForm] = Form.useForm<AccountFormValues>()
  const [editForm] = Form.useForm<AccountFormValues>()
  const [openPopup, setOpenPopup] = useState(createClosedPopupState)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AccountDto | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<AccountDto | null>(null)
  const locale = i18n.resolvedLanguage === 'de' ? 'de-DE' : 'en-US'
  const cardTitle = title ?? t('accounts.title')

  const hasOpenPopup = useMemo(() => Object.values(openPopup).some(Boolean), [openPopup])
  const currencyOptions = useMemo(
    () =>
      Array.from(new Set(accounts.map((account) => account.currencyCode)))
        .sort((left, right) => left.localeCompare(right, locale))
        .map((currencyCode) => ({ value: currencyCode, label: currencyCode })),
    [accounts, locale],
  )
  const createCurrencyOptions = useMemo(() => {
    const existingCodes = new Set(COMMON_CURRENCIES.map((currency) => currency.value))
    const additionalOptions = Array.from(
      new Set(
        accounts
          .map((account) => account.currencyCode)
          .filter((currencyCode) => currencyCode.length > 0 && !existingCodes.has(currencyCode)),
      ),
    )
      .sort((left, right) => left.localeCompare(right, locale))
      .map((currencyCode) => ({
        value: currencyCode,
        label: `${currencyCode} - ${currencyCode}`,
      }))

    return [...COMMON_CURRENCIES, ...additionalOptions]
  }, [accounts, locale])
  const balanceRules = useMemo(
    () => [
      { required: true },
      {
        validator: (_: unknown, value?: number) =>
          typeof value === 'number' && Number.isFinite(value)
            ? Promise.resolve()
            : Promise.reject(new Error(t('accounts.validation.balanceRequired'))),
      },
    ],
    [t],
  )

  const cardClassName = hasOpenPopup ? 'accounts-table accounts-table-popup-open' : 'accounts-table'
  const columns: TableColumnsType<AccountDto> = useMemo(
    () => [
      {
        title: t('accounts.columns.name'),
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name, locale),
      },
      {
        title: t('accounts.columns.currency'),
        dataIndex: 'currencyCode',
        key: 'currencyCode',
        sorter: (a, b) => a.currencyCode.localeCompare(b.currencyCode, locale),
      },
      {
        title: t('accounts.columns.balance'),
        dataIndex: 'balance',
        key: 'balance',
        align: 'right',
        sorter: (a, b) => a.balance - b.balance,
        render: (value: number, record: AccountDto) => (
          <Typography.Text strong className="account-balance">
            {formatCurrency(value, locale, record.currencyCode)}
          </Typography.Text>
        ),
      },
      {
        title: t('accounts.columns.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        render: (value: string) => new Date(value).toLocaleDateString(locale),
      },
      {
        title: '',
        key: 'actions',
        align: 'right',
        width: 96,
        render: (_value, record) => {
          const isSelected = record.id === selectedRowId

          return (
            <Space size={4} className={isSelected ? 'accounts-row-actions is-visible' : 'accounts-row-actions'}>
              <Button
                type="text"
                icon={<EditOutlined />}
                aria-label={t('accounts.actions.edit')}
                onClick={(event) => {
                  event.stopPropagation()
                  setEditingAccount(record)
                  editForm.setFieldsValue({
                    name: record.name,
                    currencyCode: record.currencyCode,
                    balance: record.balance,
                  })
                }}
                disabled={isDeletingAccount}
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                aria-label={t('accounts.actions.delete')}
                onClick={(event) => {
                  event.stopPropagation()
                  setDeletingAccount(record)
                }}
                disabled={isDeletingAccount}
              />
            </Space>
          )
        },
      },
    ],
    [editForm, isDeletingAccount, locale, selectedRowId, t],
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
    setEditingAccount(null)
    editForm.resetFields()
  }

  function openCreateModal() {
    createForm.setFieldsValue({
      name: '',
      currencyCode: accounts[0]?.currencyCode ?? 'EUR',
      balance: 0,
    })
    setIsCreateModalOpen(true)
  }

  function closeCreateModal() {
    if (isCreatingAccount) {
      return
    }

    setIsCreateModalOpen(false)
    createForm.resetFields()
  }

  async function onCreateSubmit(values: AccountFormValues) {
    try {
      await onCreateAccount({
        name: values.name.trim(),
        currencyCode: normalizeCurrencyCode(values.currencyCode),
        balance: values.balance,
      })
      setIsCreateModalOpen(false)
      createForm.resetFields()
      messageApi.success(t('accounts.create.success'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.accountCreate'))
    }
  }

  async function onEditSubmit(values: AccountFormValues) {
    if (!editingAccount) {
      return
    }

    closeEditModal()

    try {
      await onUpdateAccount(editingAccount.id, {
        name: values.name.trim(),
        currencyCode: normalizeCurrencyCode(values.currencyCode),
        balance: values.balance,
      })
      messageApi.success(t('accounts.edit.success'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.accountUpdate'))
    }
  }

  function closeDeleteModal() {
    if (isDeletingAccount) {
      return
    }

    setDeletingAccount(null)
  }

  async function onDeleteConfirm() {
    if (!deletingAccount) {
      return
    }

    const accountId = deletingAccount.id
    setDeletingAccount(null)

    try {
      await onDeleteAccount(accountId)
      messageApi.success(t('accounts.delete.success'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.accountDelete'))
    }
  }

  return (
    <Card
      className={cardClassName}
      title={cardTitle}
      variant="borderless"
      extra={
        <Button icon={<PlusOutlined />} onClick={openCreateModal} disabled={isCreatingAccount}>
          {t('accounts.create.open')}
        </Button>
      }
    >
      {messageContextHolder}
      <div className="accounts-filters" onKeyDown={onFiltersKeyDown}>
        <Space wrap size={[8, 8]}>
          <Input
            allowClear
            placeholder={t('accounts.filters.search')}
            value={filters.searchTerm}
            onChange={(event) => onFiltersChange({ ...filters, searchTerm: event.target.value || undefined })}
          />
          <Select
            allowClear
            placeholder={t('accounts.filters.currency')}
            value={filters.currencyCode}
            options={currencyOptions}
            onChange={(value) => onFiltersChange({ ...filters, currencyCode: value })}
            open={openPopup.currency}
            onOpenChange={(isOpen) => setPopupOpen('currency', isOpen)}
          />
          <Button
            onClick={() => {
              closeAllPopups()
              onApplyFilters()
            }}
          >
            {t('accounts.filters.apply')}
          </Button>
          <Button
            onClick={() => {
              closeAllPopups()
              onResetFilters()
            }}
          >
            {t('accounts.filters.reset')}
          </Button>
        </Space>
      </div>

      <Table<AccountDto>
        rowKey="id"
        columns={columns}
        showSorterTooltip={{ target: 'sorter-icon', mouseEnterDelay: 0.5 }}
        dataSource={items}
        rowClassName={(record) => (record.id === selectedRowId ? 'accounts-row-selected' : '')}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRowId((prev) => (prev === record.id ? null : record.id))
          },
        })}
        loading={isLoading}
        pagination={false}
        size="middle"
        locale={{ emptyText: t('accounts.empty') }}
      />
      <Pagination
        current={page}
        pageSize={pageSize}
        total={totalCount}
        onChange={onPageChange}
        showSizeChanger
        pageSizeOptions={['25', '50', '100']}
        showTotal={(count, range) => t('accounts.pagination.rangeOfTotal', { start: range[0], end: range[1], total: count })}
      />

      <Modal
        open={editingAccount !== null}
        wrapClassName="accounts-edit-modal"
        title={t('accounts.edit.title')}
        okText={t('accounts.edit.save')}
        cancelText={t('accounts.edit.cancel')}
        onOk={() => {
          void editForm.submit()
        }}
        onCancel={closeEditModal}
        destroyOnClose
        confirmLoading={isUpdatingAccount}
        maskClosable={!isUpdatingAccount}
      >
        <Form<AccountFormValues>
          form={editForm}
          layout="vertical"
          onFinish={(values) => void onEditSubmit(values)}
        >
          <Form.Item name="name" label={t('accounts.columns.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="currencyCode" label={t('accounts.columns.currency')} rules={[{ required: true }]}>
            <Select
              options={createCurrencyOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="balance" label={t('accounts.columns.balance')} rules={balanceRules}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={deletingAccount !== null}
        centered
        title={t('accounts.delete.confirmTitle')}
        okText={t('accounts.delete.confirm')}
        cancelText={t('accounts.delete.cancel')}
        onOk={() => {
          void onDeleteConfirm()
        }}
        onCancel={closeDeleteModal}
        confirmLoading={isDeletingAccount}
        maskClosable={!isDeletingAccount}
      >
        {deletingAccount && (
          <>
            <Typography.Paragraph style={{ marginBottom: 8 }}>
              {t('accounts.delete.confirmDescription')} ({deletingAccount.name},{' '}
              {formatCurrency(deletingAccount.balance, locale, deletingAccount.currencyCode)})
            </Typography.Paragraph>
            <Typography.Text type="danger">{t('accounts.delete.cascadeWarning')}</Typography.Text>
          </>
        )}
      </Modal>

      <Modal
        open={isCreateModalOpen}
        wrapClassName="accounts-edit-modal"
        title={t('accounts.create.title')}
        okText={t('accounts.create.save')}
        cancelText={t('accounts.create.cancel')}
        onOk={() => {
          void createForm.submit()
        }}
        onCancel={closeCreateModal}
        destroyOnClose
        confirmLoading={isCreatingAccount}
        maskClosable={!isCreatingAccount}
      >
        <Form<AccountFormValues>
          form={createForm}
          layout="vertical"
          onFinish={(values) => void onCreateSubmit(values)}
        >
          <Form.Item name="name" label={t('accounts.columns.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="currencyCode" label={t('accounts.columns.currency')} rules={[{ required: true }]}>
            <Select
              options={createCurrencyOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="balance" label={t('accounts.columns.balance')} rules={balanceRules}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
