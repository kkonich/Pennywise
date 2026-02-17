const en = {
  translation: {
    common: {
      page: 'Page',
    },
    errors: {
      accountsLoad: 'Accounts could not be loaded.',
      accountCreate: 'Account could not be created.',
      accountUpdate: 'Account could not be saved.',
      accountDelete: 'Account could not be archived.',
      settingsLoad: 'Settings could not be loaded.',
      categoriesLoad: 'Categories could not be loaded.',
      categoryCreate: 'Category could not be created.',
      categoryUpdate: 'Category could not be saved.',
      categoryDelete: 'Category could not be archived.',
      transactionsLoad: 'Transactions could not be loaded.',
      transactionCreate: 'Transaction could not be created.',
      transactionUpdate: 'Transaction could not be saved.',
      transactionDelete: 'Transaction could not be archived.',
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
        delete: 'Archive account',
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
        confirmTitle: 'Archive account?',
        confirmDescription: 'Do you really want to archive this account?',
        cascadeWarning: 'Archiving an account will also archive all related transactions!',
        confirm: 'Archive',
        cancel: 'Cancel',
        success: 'Account archived successfully.',
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
        balanceRequired: 'Balance is required.',
      },
    },
    categories: {
      title: 'Categories',
      empty: 'No categories available.',
      uncategorized: 'Uncategorized',
      columns: {
        name: 'Name',
        finances: 'Finances',
      },
      actions: {
        edit: 'Edit category',
        delete: 'Archive category',
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
        confirmTitle: 'Archive category?',
        confirmDescription: 'Do you really want to archive this category?',
        confirm: 'Archive',
        cancel: 'Cancel',
        success: 'Category archived successfully.',
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
        type: 'Type',
        bookedOn: 'Booking date',
        amount: 'Amount',
        merchant: 'Merchant',
      },
      actions: {
        edit: 'Edit transaction',
        delete: 'Archive transaction',
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
        confirmTitle: 'Archive transaction?',
        confirmDescription: 'Do you really want to archive this transaction?',
        confirm: 'Archive',
        cancel: 'Cancel',
        success: 'Transaction archived successfully.',
      },
      filters: {
        note: 'Description',
        account: 'Account',
        category: 'Category',
        type: 'Type',
        bookedFrom: 'Booked from',
        bookedTo: 'Booked to',
        minAmount: 'Min amount',
        maxAmount: 'Max amount',
        apply: 'Apply',
        reset: 'Reset',
      },
      type: {
        income: 'Income',
        expense: 'Expense',
      },
      pagination: {
        rangeOfTotal: '{{start}}-{{end}} of {{total}}',
      },
      validation: {
        amountNonZero: 'Amount must not be zero.',
      },
    },
    settings: {
      title: 'Settings',
      actions: {
        save: 'Save',
        reset: 'Reset',
      },
      messages: {
        updated: 'Settings saved.',
      },
      resetConfirm: {
        title: 'Reset changes?',
        description: 'Do you really want to discard your changes and restore the saved settings?',
        confirm: 'Reset',
        cancel: 'Cancel',
      },
      currency: {
        title: 'Default currency',
        description: 'Select the currency used for all accounts, transactions, and categories.',
        label: 'Currency',
        required: 'Please choose a currency.',
        appliesGlobally: 'Applies to all balances and transactions.',
      },
    },
  },
} as const

export default en
