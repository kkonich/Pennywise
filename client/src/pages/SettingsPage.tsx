import { Button, Card, Form, Modal, Select, Space, Switch, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMMON_CURRENCIES } from '../constants/currencies'
import { useDemoData } from '../hooks/useDemoData'
import { useUserSettings } from '../hooks/useUserSettings'

type SettingsFormValues = {
  currencyCode: string
}

export function SettingsPage() {
  const { t } = useTranslation()
  const [messageApi, messageContextHolder] = message.useMessage()
  const { settings, isLoading, error, updateCurrency, isUpdating } = useUserSettings()
  const { exists: demoDataExists, isLoading: isDemoDataLoading, error: demoDataError, toggle, isUpdating: isDemoDataUpdating } =
    useDemoData()
  const [form] = Form.useForm<SettingsFormValues>()
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const watchedCurrencyCode = Form.useWatch('currencyCode', form)

  const normalizedWatchedCurrencyCode = watchedCurrencyCode?.trim().toUpperCase() ?? ''
  const normalizedSavedCurrencyCode = settings?.currencyCode.trim().toUpperCase() ?? ''
  const hasChanges = Boolean(settings) && normalizedWatchedCurrencyCode !== normalizedSavedCurrencyCode

  useEffect(() => {
    if (error) {
      messageApi.error(error)
    }
    if (demoDataError) {
      messageApi.error(demoDataError)
    }
  }, [error, demoDataError, messageApi])

  useEffect(() => {
    if (!settings) {
      return
    }

    form.setFieldsValue({ currencyCode: settings.currencyCode })
  }, [form, settings])

  async function onSubmit(values: SettingsFormValues) {
    await updateCurrency(values.currencyCode)
    messageApi.success(t('settings.messages.updated'))
  }

  function onReset() {
    if (!settings || !hasChanges) {
      return
    }

    setIsResetModalOpen(true)
  }

  function closeResetModal() {
    if (isUpdating) {
      return
    }

    setIsResetModalOpen(false)
  }

  function confirmReset() {
    if (!settings) {
      return
    }

    form.setFieldsValue({ currencyCode: settings.currencyCode })
    setIsResetModalOpen(false)
  }

  return (
    <Card title={t('settings.title')} loading={isLoading}>
      {messageContextHolder}
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ minHeight: 260, display: 'flex', flexDirection: 'column' }}>
          <Typography.Title level={4} style={{ marginBottom: 4 }}>
            {t('settings.currency.title')}
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            style={{ marginBottom: 12, color: 'var(--color-text-secondary)' }}
          >
            {t('settings.currency.description')}
          </Typography.Paragraph>
          <Form<SettingsFormValues>
            form={form}
            layout="vertical"
            onFinish={(values) => void onSubmit(values)}
            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
          >
            <Form.Item
              name="currencyCode"
              label={t('settings.currency.label')}
              rules={[{ required: true, message: t('settings.currency.required') }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={COMMON_CURRENCIES}
                disabled={isUpdating}
              />
            </Form.Item>

            <Typography.Text type="secondary" style={{ color: 'var(--color-text-secondary)' }}>
              {t('settings.currency.appliesGlobally')}
            </Typography.Text>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
              <Space>
                <Button onClick={onReset} disabled={!hasChanges || isUpdating}>
                  {t('settings.actions.reset')}
                </Button>
                <Button htmlType="submit" loading={isUpdating} disabled={!hasChanges}>
                  {t('settings.actions.save')}
                </Button>
              </Space>
            </div>
          </Form>
        </div>

        {import.meta.env.DEV ? (
          <div style={{ borderTop: '1px solid var(--color-border-secondary)', paddingTop: 16 }}>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              {t('settings.demoData.title')}
            </Typography.Title>
            <Typography.Paragraph
              type="secondary"
              style={{ marginBottom: 12, color: 'var(--color-text-secondary)' }}
            >
              {t('settings.demoData.description')}
            </Typography.Paragraph>
            <Switch
              checked={demoDataExists}
              onChange={async (checked) => {
                try {
                  await toggle(checked)
                  messageApi.success(
                    checked
                      ? t('settings.demoData.enabledMessage')
                      : t('settings.demoData.disabledMessage'),
                  )
                } catch (err) {
                  const msg = err instanceof Error ? err.message : t('settings.demoData.error')
                  messageApi.error(msg)
                }
              }}
              loading={isDemoDataLoading || isDemoDataUpdating}
            />
          </div>
        ) : null}
      </Space>

      <Modal
        open={isResetModalOpen}
        centered
        title={t('settings.resetConfirm.title')}
        okText={t('settings.resetConfirm.confirm')}
        cancelText={t('settings.resetConfirm.cancel')}
        onOk={confirmReset}
        onCancel={closeResetModal}
        mask={{ closable: !isUpdating }}
      >
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('settings.resetConfirm.description')}
        </Typography.Paragraph>
      </Modal>
    </Card>
  )
}
