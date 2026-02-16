const de = {
  translation: {
    common: {
      page: 'Seite',
    },
    errors: {
      transactionsLoad: 'Transaktionen konnten nicht geladen werden.',
      transactionUpdate: 'Transaktion konnte nicht gespeichert werden.',
      transactionDelete: 'Transaktion konnte nicht gelöscht werden.',
    },
    brand: {
      logoAlt: 'Pennywise',
    },
    nav: {
      dashboard: 'Übersicht',
      accounts: 'Konten',
      categories: 'Kategorien',
      transactions: 'Transaktionen',
      settings: 'Einstellungen',
    },
    transactions: {
      titleLatest: 'Letzte Transaktionen',
      empty: 'Keine Transaktionen vorhanden.',
      fallback: {
        unknownAccount: '(Unbekanntes Konto)',
        unknownCategory: '(Unbekannte Kategorie)',
      },
      columns: {
        note: 'Beschreibung',
        account: 'Konto',
        category: 'Kategorie',
        bookedOn: 'Buchungsdatum',
        amount: 'Betrag',
        merchant: 'Transaktionspartner',
      },
      actions: {
        edit: 'Transaktion bearbeiten',
        delete: 'Transaktion löschen',
      },
      edit: {
        title: 'Transaktion bearbeiten',
        save: 'Speichern',
        cancel: 'Abbrechen',
      },
      delete: {
        confirmTitle: 'Transaktion löschen?',
        confirmDescription: 'Möchtest du diese Transaktion wirklich löschen?',
        confirm: 'Löschen',
        cancel: 'Abbrechen',
        success: 'Transaktion wurde erfolgreich gelöscht.',
      },
      filters: {
        note: 'Beschreibung',
        account: 'Konto',
        category: 'Kategorie',
        bookedFrom: 'Buchung von',
        bookedTo: 'Buchung bis',
        minAmount: 'Betrag min',
        maxAmount: 'Betrag max',
        apply: 'Anwenden',
        reset: 'Zurücksetzen',
      },
      pagination: {
        rangeOfTotal: '{{start}}-{{end}} von {{total}}',
      },
    },
  },
} as const

export default de
