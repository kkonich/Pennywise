const de = {
  translation: {
    common: {
      page: 'Seite',
    },
    errors: {
      transactionsLoad: 'Transaktionen konnten nicht geladen werden.',
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
