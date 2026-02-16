const en = {
  translation: {
    common: {
      page: 'Page',
    },
    errors: {
      accountsLoad: 'Accounts could not be loaded.',
      accountCreate: 'Account could not be created.',
      accountUpdate: 'Account could not be saved.',
      accountDelete: 'Account could not be deleted.',
      categoriesLoad: 'Categories could not be loaded.',
      categoryCreate: 'Category could not be created.',
      categoryUpdate: 'Category could not be saved.',
      categoryDelete: 'Category could not be deleted.',
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
    accounts: {
      title: 'Accounts',
      empty: 'No accounts available.',
      columns: {
        name: 'Name',
        currency: 'Currency',
        balance: 'Balance',
        createdAt: 'Created on',
      },
      actions: {
        edit: 'Edit account',
        delete: 'Delete account',
      },
      edit: {
        title: 'Edit account',
        save: 'Save',
        cancel: 'Cancel',
        success: 'Account saved successfully.',
      },
      create: {
        open: 'Add account',
        title: 'Add account',
        save: 'Create',
        cancel: 'Cancel',
        success: 'Account created successfully.',
      },
      delete: {
        confirmTitle: 'Delete account?',
        confirmDescription: 'Do you really want to delete this account?',
        cascadeWarning: 'Deleting an account will also delete all related transactions!',
        confirm: 'Delete',
        cancel: 'Cancel',
        success: 'Account deleted successfully.',
      },
      filters: {
        search: 'Search by name or currency',
        currency: 'Currency',
        apply: 'Apply',
        reset: 'Reset',
      },
      pagination: {
        rangeOfTotal: '{{start}}-{{end}} of {{total}}',
      },
      validation: {
        balanceRequired: 'Balance is required.',
      },
    },
    categories: {
      title: 'Categories',
      empty: 'No categories available.',
      columns: {
        name: 'Name',
        finances: 'Finances',
      },
      actions: {
        edit: 'Edit category',
        delete: 'Delete category',
      },
      edit: {
        title: 'Edit category',
        save: 'Save',
        cancel: 'Cancel',
        success: 'Category saved successfully.',
      },
      create: {
        open: 'Add category',
        title: 'Add category',
        save: 'Create',
        cancel: 'Cancel',
        success: 'Category created successfully.',
      },
      delete: {
        confirmTitle: 'Delete category?',
        confirmDescription: 'Do you really want to delete this category?',
        confirm: 'Delete',
        cancel: 'Cancel',
        success: 'Category deleted successfully.',
      },
      filters: {
        search: 'Search by name',
        apply: 'Apply',
        reset: 'Reset',
      },
      pagination: {
        rangeOfTotal: '{{start}}-{{end}} of {{total}}',
      },
      validation: {
        nameRequired: 'Name is required.',
      },
    },
    transactions: {
      titleLatest: 'All Transactions',
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
