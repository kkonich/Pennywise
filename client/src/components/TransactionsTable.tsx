import { Card, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'

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

export function TransactionsTable({ items, title = 'Letzte Transaktionen' }: TransactionsTableProps) {
  return (
    <Card className="transactions-card transactions-table-card" title={title} bordered={false}>
      <Table<TransactionItem>
        rowKey="id"
        columns={columns}
        dataSource={items}
        pagination={false}
        size="middle"
      />
    </Card>
  )
}
