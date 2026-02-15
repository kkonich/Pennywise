const en = {
  translation: {
    common: {
      page: 'Page',
    },
    errors: {
      transactionsLoad: 'Transactions could not be loaded.',
    },
    brand: {
      logoAlt: 'Pennywise',
    },
    nav: {
      dashboard: 'Dashboard',
      accounts: 'Accounts',
      categories: 'Categories',
      transactions: 'Transactions',
      settings: 'Settings',
    },
    transactions: {
      titleLatest: 'Latest Transactions',
      empty: 'No transactions available.',
      fallback: {
        unknownAccount: '(Unknown account)',
        unknownCategory: '(Unknown category)',
      },
      columns: {
        note: 'Description',
        account: 'Account',
        category: 'Category',
        bookedOn: 'Booking date',
        amount: 'Amount',
        merchant: 'Merchant',
      },
      filters: {
        note: 'Description',
        account: 'Account',
        category: 'Category',
        bookedFrom: 'Booked from',
        bookedTo: 'Booked to',
        minAmount: 'Min amount',
        maxAmount: 'Max amount',
        apply: 'Apply',
        reset: 'Reset',
      },
      pagination: {
        rangeOfTotal: '{{start}}-{{end}} of {{total}}',
      },
    },
  },
} as const

export default en
