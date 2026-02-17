import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Modal, Pagination, Space, Table, Typography, message } from 'antd'
import type { TableColumnsType } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CategoryFilterDraft } from '../hooks/useCategoriesTableData'
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
  onApplyFilters: () => void
  onResetFilters: () => void
  onPageChange: (page: number, pageSize: number) => void
  onCreateCategory: (request: CategoryCreateRequest) => Promise<void>
  onUpdateCategory: (id: string, request: CategoryUpdateRequest) => Promise<void>
  onDeleteCategory: (id: string) => Promise<void>
  isCreatingCategory?: boolean
  isUpdatingCategory?: boolean
  isDeletingCategory?: boolean
}

type CategoryFormValues = {
  name: string
}

function formatMoney(value: number, locale: string, currencyCode: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'code',
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
  isCreatingCategory = false,
  isUpdatingCategory = false,
  isDeletingCategory = false,
}: CategoriesTableProps) {
  const { t, i18n } = useTranslation()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [createForm] = Form.useForm<CategoryFormValues>()
  const [editForm] = Form.useForm<CategoryFormValues>()
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryDto | null>(null)
  const locale = i18n.resolvedLanguage === 'de' ? 'de-DE' : 'en-US'
  const cardTitle = title ?? t('categories.title')
  const cardClassName = 'categories-table'

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

  return (
    <Card
      className={cardClassName}
      title={cardTitle}
      variant="borderless"
      extra={
        <Button icon={<PlusOutlined />} onClick={openCreateModal} disabled={isCreatingCategory}>
          {t('categories.create.open')}
        </Button>
      }
    >
      {messageContextHolder}
      <div className="categories-filters" onKeyDown={onFiltersKeyDown}>
        <Space wrap size={[8, 8]}>
          <Input
            allowClear
            placeholder={t('categories.filters.search')}
            value={filters.searchTerm}
            onChange={(event) => onFiltersChange({ ...filters, searchTerm: event.target.value || undefined })}
          />
          <Button onClick={onApplyFilters}>{t('categories.filters.apply')}</Button>
          <Button onClick={onResetFilters}>{t('categories.filters.reset')}</Button>
        </Space>
      </div>

      <Table<CategoryDto>
        rowKey="id"
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
        </Form>
      </Modal>
    </Card>
  )
}
