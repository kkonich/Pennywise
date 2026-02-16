const en = {
  translation: {
    common: {
      page: 'Page',
    },
    errors: {
      transactionsLoad: 'Transactions could not be loaded.',
      transactionCreate: 'Transaction could not be created.',
      transactionUpdate: 'Transaction could not be saved.',
      transactionDelete: 'Transaction could not be deleted.',
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
      actions: {
        edit: 'Edit transaction',
        delete: 'Delete transaction',
      },
      edit: {
        title: 'Edit transaction',
        save: 'Save',
        cancel: 'Cancel',
      },
      create: {
        open: 'Add transaction',
        title: 'Add transaction',
        save: 'Create',
        cancel: 'Cancel',
        success: 'Transaction created successfully.',
      },
      delete: {
        confirmTitle: 'Delete transaction?',
        confirmDescription: 'Do you really want to delete this transaction?',
        confirm: 'Delete',
        cancel: 'Cancel',
        success: 'Transaction deleted successfully.',
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
      validation: {
        amountNonZero: 'Amount must not be zero.',
      },
    },
  },
} as const

export default en
