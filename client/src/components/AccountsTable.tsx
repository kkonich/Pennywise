import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, InputNumber, Modal, Pagination, Space, Table, Typography, message } from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AccountFilterDraft } from '../hooks/useAccountsTableData'
import type { AccountCreateRequest, AccountDto, AccountUpdateRequest } from '../types/account'

type AccountsTableProps = {
  items: AccountDto[]
  currencyCode: string
  title?: string
  isLoading?: boolean
  page: number
  pageSize: number
  totalCount: number
  filters: AccountFilterDraft
  onFiltersChange: (next: AccountFilterDraft) => void
  onApplyFilters: (next?: AccountFilterDraft) => void
  onResetFilters: () => void
  onPageChange: (page: number, pageSize: number) => void
  onCreateAccount: (request: AccountCreateRequest) => Promise<void>
  onUpdateAccount: (id: string, request: AccountUpdateRequest) => Promise<void>
  onDeleteAccount: (id: string) => Promise<void>
  onArchiveAccounts: (ids: string[]) => Promise<void>
  isCreatingAccount?: boolean
  isUpdatingAccount?: boolean
  isDeletingAccount?: boolean
  isArchivingAccounts?: boolean
}

type AccountFormValues = {
  name: string
  balance: number
}

function formatCurrency(value: number, locale: string, currencyCode: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(value)
}

export function AccountsTable({
  items,
  currencyCode,
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
  onArchiveAccounts,
  isCreatingAccount = false,
  isUpdatingAccount = false,
  isDeletingAccount = false,
  isArchivingAccounts = false,
}: AccountsTableProps) {
  const { t, i18n } = useTranslation()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [createForm] = Form.useForm<AccountFormValues>()
  const [editForm] = Form.useForm<AccountFormValues>()
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AccountDto | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<AccountDto | null>(null)
  const locale = i18n.resolvedLanguage === 'de' ? 'de-DE' : 'en-US'
  const cardTitle = title ?? t('accounts.title')

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

  const cardClassName = 'accounts-table'
  const hasSelection = selectedRowKeys.length > 0
  const rowSelection: NonNullable<TableProps<AccountDto>['rowSelection']> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys.map(String)),
  }
  const columns: TableColumnsType<AccountDto> = useMemo(
    () => [
      {
        title: t('accounts.columns.name'),
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name, locale),
      },
      {
        title: t('accounts.columns.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        render: (value: string) => new Date(value).toLocaleDateString(locale),
      },
      {
        title: t('accounts.columns.balance'),
        dataIndex: 'balance',
        key: 'balance',
        align: 'right',
        sorter: (a, b) => a.balance - b.balance,
        render: (value: number) => (
          <Typography.Text strong className="account-balance">
            {formatCurrency(value, locale, currencyCode)}
          </Typography.Text>
        ),
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
    [currencyCode, editForm, isDeletingAccount, locale, selectedRowId, t],
  )

  function closeEditModal() {
    setEditingAccount(null)
    editForm.resetFields()
  }

  function openCreateModal() {
    createForm.setFieldsValue({
      name: '',
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

  async function onArchiveSelected() {
    if (selectedRowKeys.length === 0) {
      return
    }

    try {
      await onArchiveAccounts(selectedRowKeys.map(String))
      setSelectedRowKeys([])
      setIsArchiveConfirmOpen(false)
      messageApi.success(t('accounts.archive.selectedSuccess'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.accountDelete'))
    }
  }

  function closeArchiveConfirmModal() {
    if (isArchivingAccounts) {
      return
    }

    setIsArchiveConfirmOpen(false)
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
            onClick={() => {
              setIsArchiveConfirmOpen(true)
            }}
            disabled={!hasSelection}
            loading={isArchivingAccounts}
          >
            {t('accounts.archive.selected')}
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreateModal} disabled={isCreatingAccount}>
            {t('accounts.create.open')}
          </Button>
        </Space>
      }
    >
      {messageContextHolder}
      <div className="accounts-filters">
        <Space wrap size={[8, 8]}>
          <Input
            allowClear
            placeholder={t('accounts.filters.search')}
            value={filters.searchTerm}
            onChange={(event) => {
              const nextFilters = { ...filters, searchTerm: event.target.value || undefined }
              onFiltersChange(nextFilters)

              if (!nextFilters.searchTerm && filters.searchTerm) {
                onApplyFilters(nextFilters)
              }
            }}
            onPressEnter={() => {
              onApplyFilters()
            }}
          />
          <Button
            onClick={() => {
              onApplyFilters()
            }}
          >
            {t('accounts.filters.apply')}
          </Button>
          <Button
            onClick={() => {
              onResetFilters()
            }}
          >
            {t('accounts.filters.reset')}
          </Button>
        </Space>
      </div>

      <Table<AccountDto>
        rowKey="id"
        rowSelection={rowSelection}
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
        destroyOnHidden
        confirmLoading={isUpdatingAccount}
        mask={{ closable: !isUpdatingAccount }}
      >
        <Form<AccountFormValues>
          form={editForm}
          layout="vertical"
          onFinish={(values) => void onEditSubmit(values)}
        >
          <Form.Item name="name" label={t('accounts.columns.name')} rules={[{ required: true }]}>
            <Input />
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
        mask={{ closable: !isDeletingAccount }}
      >
        {deletingAccount && (
          <>
            <Typography.Paragraph style={{ marginBottom: 8 }}>
              {t('accounts.delete.confirmDescription')} ({deletingAccount.name},{' '}
              {formatCurrency(deletingAccount.balance, locale, currencyCode)})
            </Typography.Paragraph>
            <Typography.Text type="danger">{t('accounts.delete.cascadeWarning')}</Typography.Text>
          </>
        )}
      </Modal>

      <Modal
        open={isArchiveConfirmOpen}
        centered
        title={t('accounts.archive.selected')}
        okText={t('accounts.delete.confirm')}
        cancelText={t('accounts.delete.cancel')}
        onOk={() => {
          void onArchiveSelected()
        }}
        onCancel={closeArchiveConfirmModal}
        confirmLoading={isArchivingAccounts}
        mask={{ closable: !isArchivingAccounts }}
      >
        <Typography.Text type="danger">{t('accounts.delete.cascadeWarning')}</Typography.Text>
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
        destroyOnHidden
        confirmLoading={isCreatingAccount}
        mask={{ closable: !isCreatingAccount }}
      >
        <Form<AccountFormValues>
          form={createForm}
          layout="vertical"
          onFinish={(values) => void onCreateSubmit(values)}
        >
          <Form.Item name="name" label={t('accounts.columns.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="balance" label={t('accounts.columns.balance')} rules={balanceRules}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
