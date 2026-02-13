import { TransactionsTable } from '../components/TransactionsTable'
import type { TransactionItem } from '../components/TransactionsTable'

const transactions: TransactionItem[] = [
  {
    id: 'tr-001',
    note: 'Einkauf Supermarkt',
    account: 'Girokonto',
    category: 'Lebensmittel',
    bookedOn: '2026-02-10',
    quantity: -82.5,
    merchant: 'REWE',
    currencyCode: 'EUR',
  },
  {
    id: 'tr-002',
    note: 'Gehalt Februar',
    account: 'Girokonto',
    category: 'Einkommen',
    bookedOn: '2026-02-09',
    quantity: 2850,
    merchant: 'Tech GmbH',
    currencyCode: 'EUR',
  },
  {
    id: 'tr-003',
    note: 'Monatsabo Streaming',
    account: 'Kreditkarte',
    category: 'Abos',
    bookedOn: '2026-02-08',
    quantity: -13.99,
    merchant: 'Netflix',
    currencyCode: 'EUR',
  },
  {
    id: 'tr-004',
    note: 'Strom Abschlag',
    account: 'Girokonto',
    category: 'Wohnen',
    bookedOn: '2026-02-07',
    quantity: -65,
    merchant: 'Energie AG',
    currencyCode: 'EUR',
  },
  {
    id: 'tr-005',
    note: 'Rueckerstattung Bestellung',
    account: 'Girokonto',
    category: 'Rueckerstattung',
    bookedOn: '2026-02-06',
    quantity: 24.9,
    merchant: 'Amazon',
    currencyCode: 'EUR',
  },
]

export function TransactionsPage() {
  return <TransactionsTable items={transactions} />
}
