import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Checkbox, Form, Input, Modal, Pagination, Select, Space, Table, Tag, Typography, message } from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CategoryFilterDraft } from '../hooks/useCategoriesTableData'
import { UNCATEGORIZED_CATEGORY_ID } from '../constants/system'
import type { CategoryCreateRequest, CategoryDto, CategoryUpdateRequest } from '../types/category'

type CategoriesTableProps = {
  items: CategoryDto[]
  spentByCategoryId: Record<string, number>
  currencyCode: string
  title?: string
  isLoading?: boolean
  page: number
  pageSize: number
  totalCount: number
  filters: CategoryFilterDraft
  onFiltersChange: (next: CategoryFilterDraft) => void
  onApplyFilters: (next?: CategoryFilterDraft) => void
  onResetFilters: () => void
  onPageChange: (page: number, pageSize: number) => void
  onCreateCategory: (request: CategoryCreateRequest) => Promise<void>
  onUpdateCategory: (id: string, request: CategoryUpdateRequest) => Promise<void>
  onDeleteCategory: (id: string) => Promise<void>
  onArchiveCategories: (ids: string[]) => Promise<void>
  isCreatingCategory?: boolean
  isUpdatingCategory?: boolean
  isDeletingCategory?: boolean
  isArchivingCategory?: boolean
}

type CategoryFormValues = {
  name: string
  type: 'Expense' | 'Income'
}

function formatMoney(value: number, locale: string, currencyCode: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value)
}

export function CategoriesTable({
  items,
  spentByCategoryId,
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
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onArchiveCategories,
  isCreatingCategory = false,
  isUpdatingCategory = false,
  isDeletingCategory = false,
  isArchivingCategory = false,
}: CategoriesTableProps) {
  const { t, i18n } = useTranslation()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [createForm] = Form.useForm<CategoryFormValues>()
  const [editForm] = Form.useForm<CategoryFormValues>()
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryDto | null>(null)
  const locale = i18n.resolvedLanguage === 'de' ? 'de-DE' : 'en-US'
  const cardTitle = title ?? t('categories.title')
  const cardClassName = 'categories-table'
  const hasSelection = selectedRowKeys.length > 0
  const rowSelection: NonNullable<TableProps<CategoryDto>['rowSelection']> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys.map(String)),
    getCheckboxProps: (record: CategoryDto) => ({
      disabled: record.id === UNCATEGORIZED_CATEGORY_ID,
    }),
    renderCell: (_checked, record, _index, originNode) =>
      record.id === UNCATEGORIZED_CATEGORY_ID ? null : originNode,
  }

  const nameRules = useMemo(
    () => [
      {
        validator: (_: unknown, value?: string) =>
          value?.trim() ? Promise.resolve() : Promise.reject(new Error(t('categories.validation.nameRequired'))),
      },
    ],
    [t],
  )

  const columns: TableColumnsType<CategoryDto> = useMemo(
    () => [
      {
        title: t('categories.columns.name'),
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name, locale),
        render: (_value, record) =>
          record.id === UNCATEGORIZED_CATEGORY_ID ? t('categories.uncategorized') : record.name,
      },
      {
        title: t('transactions.columns.type'),
        dataIndex: 'type',
        key: 'type',
        onFilter: (value, record) => record.type === value,
        filterDropdown: (filterState) => {
          const selectedTypeKeys = filterState.selectedKeys.filter(
            (key): key is CategoryDto['type'] => key === 'Expense' || key === 'Income',
          )

          function onTypeSelectionChange(typeKey: CategoryDto['type'], isChecked: boolean) {
            const nextSelectedTypeKeys = isChecked
              ? Array.from(new Set([...selectedTypeKeys, typeKey]))
              : selectedTypeKeys.filter((selectedTypeKey) => selectedTypeKey !== typeKey)

            filterState.setSelectedKeys(nextSelectedTypeKeys)
            filterState.confirm({ closeDropdown: false })
          }

          return (
            <Space direction="vertical" size={8} style={{ padding: 8 }}>
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
        render: (value: CategoryDto['type']) => (
          <Tag
            className={
              value === 'Income'
                ? 'category-type-tag category-type-tag-income'
                : 'category-type-tag category-type-tag-expense'
            }
          >
            {t(`transactions.type.${value.toLowerCase() as 'income' | 'expense'}`)}
          </Tag>
        ),
      },
      {
        title: t('categories.columns.finances'),
        key: 'finances',
        align: 'right',
        sorter: (a, b) => (spentByCategoryId[a.id] ?? 0) - (spentByCategoryId[b.id] ?? 0),
        render: (_value, record) => {
          const total = spentByCategoryId[record.id] ?? 0
          const financeClassName =
            total > 0
              ? 'category-finance category-finance-positive'
              : total < 0
                ? 'category-finance category-finance-negative'
                : 'category-finance category-finance-neutral'

          return (
            <Typography.Text strong className={financeClassName}>
              {formatMoney(total, locale, currencyCode)}
            </Typography.Text>
          )
        },
      },
      {
        title: '',
        key: 'actions',
        align: 'right',
        width: 96,
        render: (_value, record) => {
          if (record.id === UNCATEGORIZED_CATEGORY_ID) {
            return null
          }
          const isSelected = record.id === selectedRowId
          return (
            <Space size={4} className={isSelected ? 'categories-row-actions is-visible' : 'categories-row-actions'}>
              <Button
                type="text"
                icon={<EditOutlined />}
                aria-label={t('categories.actions.edit')}
                onClick={(event) => {
                  event.stopPropagation()
                  setEditingCategory(record)
                  editForm.setFieldsValue({
                    name: record.name,
                    type: record.type,
                  })
                }}
                disabled={isDeletingCategory}
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                aria-label={t('categories.actions.delete')}
                onClick={(event) => {
                  event.stopPropagation()
                  setDeletingCategory(record)
                }}
                disabled={isDeletingCategory}
              />
            </Space>
          )
        },
      },
    ],
    [currencyCode, editForm, isDeletingCategory, locale, selectedRowId, spentByCategoryId, t],
  )

  function onFiltersKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement

    if (event.key === 'Enter' && !target.closest('button')) {
      event.preventDefault()
      onApplyFilters()
    }
  }

  function closeEditModal() {
    setEditingCategory(null)
    editForm.resetFields()
  }

  function openCreateModal() {
    createForm.setFieldsValue({
      name: '',
      type: 'Expense',
    })
    setIsCreateModalOpen(true)
  }

  function closeCreateModal() {
    if (isCreatingCategory) {
      return
    }

    setIsCreateModalOpen(false)
    createForm.resetFields()
  }

  async function onCreateSubmit(values: CategoryFormValues) {
    try {
      await onCreateCategory({
        name: values.name.trim(),
        type: values.type,
      })
      setIsCreateModalOpen(false)
      createForm.resetFields()
      messageApi.success(t('categories.create.success'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.categoryCreate'))
    }
  }

  async function onEditSubmit(values: CategoryFormValues) {
    if (!editingCategory) {
      return
    }

    closeEditModal()

    try {
      await onUpdateCategory(editingCategory.id, {
        name: values.name.trim(),
        type: values.type,
      })
      messageApi.success(t('categories.edit.success'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.categoryUpdate'))
    }
  }

  function closeDeleteModal() {
    if (isDeletingCategory) {
      return
    }

    setDeletingCategory(null)
  }

  async function onDeleteConfirm() {
    if (!deletingCategory) {
      return
    }

    const categoryId = deletingCategory.id
    setDeletingCategory(null)

    try {
      await onDeleteCategory(categoryId)
      messageApi.success(t('categories.delete.success'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.categoryDelete'))
    }
  }

  async function onArchiveSelected() {
    if (selectedRowKeys.length === 0) {
      return
    }

    try {
      await onArchiveCategories(selectedRowKeys.map(String))
      setSelectedRowKeys([])
      messageApi.success(t('categories.archive.selectedSuccess'))
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t('errors.categoryDelete'))
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
            loading={isArchivingCategory}
          >
            {t('categories.archive.selected')}
          </Button>
          <Button icon={<PlusOutlined />} onClick={openCreateModal} disabled={isCreatingCategory}>
            {t('categories.create.open')}
          </Button>
        </Space>
      }
    >
      {messageContextHolder}
      <div className="categories-filters" onKeyDown={onFiltersKeyDown}>
        <Space wrap size={[8, 8]}>
          <Input
            allowClear
            placeholder={t('categories.filters.search')}
            value={filters.searchTerm}
            onChange={(event) => {
              const nextFilters = { ...filters, searchTerm: event.target.value || undefined }
              onFiltersChange(nextFilters)

              if (!nextFilters.searchTerm && filters.searchTerm) {
                onApplyFilters(nextFilters)
              }
            }}
          />
          <Button onClick={() => onApplyFilters()}>{t('categories.filters.apply')}</Button>
          <Button onClick={onResetFilters}>{t('categories.filters.reset')}</Button>
        </Space>
      </div>

      <Table<CategoryDto>
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns}
        showSorterTooltip={{ target: 'sorter-icon', mouseEnterDelay: 0.5 }}
        dataSource={items}
        rowClassName={(record) => (record.id === selectedRowId ? 'categories-row-selected' : '')}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRowId((prev) => (prev === record.id ? null : record.id))
          },
        })}
        loading={isLoading}
        pagination={false}
        size="middle"
        locale={{ emptyText: t('categories.empty') }}
      />
      <Pagination
        current={page}
        pageSize={pageSize}
        total={totalCount}
        onChange={onPageChange}
        showSizeChanger
        pageSizeOptions={['25', '50', '100']}
        showTotal={(count, range) =>
          t('categories.pagination.rangeOfTotal', { start: range[0], end: range[1], total: count })
        }
      />

      <Modal
        open={editingCategory !== null}
        wrapClassName="categories-edit-modal"
        title={t('categories.edit.title')}
        okText={t('categories.edit.save')}
        cancelText={t('categories.edit.cancel')}
        onOk={() => {
          void editForm.submit()
        }}
        onCancel={closeEditModal}
        destroyOnHidden
        confirmLoading={isUpdatingCategory}
        mask={{ closable: !isUpdatingCategory }}
      >
        <Form<CategoryFormValues>
          form={editForm}
          layout="vertical"
          onFinish={(values) => void onEditSubmit(values)}
        >
          <Form.Item name="name" label={t('categories.columns.name')} rules={nameRules}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label={t('transactions.columns.type')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'Expense', label: t('transactions.type.expense') },
                { value: 'Income', label: t('transactions.type.income') },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={deletingCategory !== null}
        centered
        title={t('categories.delete.confirmTitle')}
        okText={t('categories.delete.confirm')}
        cancelText={t('categories.delete.cancel')}
        onOk={() => {
          void onDeleteConfirm()
        }}
        onCancel={closeDeleteModal}
        confirmLoading={isDeletingCategory}
        mask={{ closable: !isDeletingCategory }}
      >
        {deletingCategory && (
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t('categories.delete.confirmDescription')} ({deletingCategory.name})
          </Typography.Paragraph>
        )}
      </Modal>

      <Modal
        open={isCreateModalOpen}
        wrapClassName="categories-edit-modal"
        title={t('categories.create.title')}
        okText={t('categories.create.save')}
        cancelText={t('categories.create.cancel')}
        onOk={() => {
          void createForm.submit()
        }}
        onCancel={closeCreateModal}
        destroyOnHidden
        confirmLoading={isCreatingCategory}
        mask={{ closable: !isCreatingCategory }}
      >
        <Form<CategoryFormValues>
          form={createForm}
          layout="vertical"
          onFinish={(values) => void onCreateSubmit(values)}
        >
          <Form.Item name="name" label={t('categories.columns.name')} rules={nameRules}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label={t('transactions.columns.type')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'Expense', label: t('transactions.type.expense') },
                { value: 'Income', label: t('transactions.type.income') },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
