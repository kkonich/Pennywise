const de = {
  translation: {
    common: {
      page: 'Seite',
    },
    errors: {
      accountsLoad: 'Konten konnten nicht geladen werden.',
      accountCreate: 'Konto konnte nicht erstellt werden.',
      accountUpdate: 'Konto konnte nicht gespeichert werden.',
      accountDelete: 'Konto konnte nicht gelöscht werden.',
      categoriesLoad: 'Kategorien konnten nicht geladen werden.',
      categoryCreate: 'Kategorie konnte nicht erstellt werden.',
      categoryUpdate: 'Kategorie konnte nicht gespeichert werden.',
      categoryDelete: 'Kategorie konnte nicht gelöscht werden.',
      transactionsLoad: 'Transaktionen konnten nicht geladen werden.',
      transactionCreate: 'Transaktion konnte nicht erstellt werden.',
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
    accounts: {
      title: 'Konten',
      empty: 'Keine Konten vorhanden.',
      columns: {
        name: 'Name',
        currency: 'Währung',
        balance: 'Kontostand',
        createdAt: 'Erstellt am',
      },
      actions: {
        edit: 'Konto bearbeiten',
        delete: 'Konto löschen',
      },
      edit: {
        title: 'Konto bearbeiten',
        save: 'Speichern',
        cancel: 'Abbrechen',
        success: 'Konto wurde erfolgreich gespeichert.',
      },
      create: {
        open: 'Konto hinzufügen',
        title: 'Konto hinzufügen',
        save: 'Erstellen',
        cancel: 'Abbrechen',
        success: 'Konto wurde erfolgreich erstellt.',
      },
      delete: {
        confirmTitle: 'Konto löschen?',
        confirmDescription: 'Möchtest du dieses Konto wirklich löschen?',
        cascadeWarning:
          'Beim Löschen eines Kontos werden auch alle damit verbundenen Transaktionen gelöscht!',
        confirm: 'Löschen',
        cancel: 'Abbrechen',
        success: 'Konto wurde erfolgreich gelöscht.',
      },
      filters: {
        search: 'Nach Name oder Währung suchen',
        currency: 'Währung',
        apply: 'Anwenden',
        reset: 'Zurücksetzen',
      },
      pagination: {
        rangeOfTotal: '{{start}}-{{end}} von {{total}}',
      },
      validation: {
        balanceRequired: 'Kontostand ist erforderlich.',
      },
    },
    categories: {
      title: 'Kategorien',
      empty: 'Keine Kategorien vorhanden.',
      columns: {
        name: 'Name',
        finances: 'Finanzen',
      },
      actions: {
        edit: 'Kategorie bearbeiten',
        delete: 'Kategorie löschen',
      },
      edit: {
        title: 'Kategorie bearbeiten',
        save: 'Speichern',
        cancel: 'Abbrechen',
        success: 'Kategorie wurde erfolgreich gespeichert.',
      },
      create: {
        open: 'Kategorie hinzufügen',
        title: 'Kategorie hinzufügen',
        save: 'Erstellen',
        cancel: 'Abbrechen',
        success: 'Kategorie wurde erfolgreich erstellt.',
      },
      delete: {
        confirmTitle: 'Kategorie löschen?',
        confirmDescription: 'Möchtest du diese Kategorie wirklich löschen?',
        confirm: 'Löschen',
        cancel: 'Abbrechen',
        success: 'Kategorie wurde erfolgreich gelöscht.',
      },
      filters: {
        search: 'Nach Name suchen',
        apply: 'Anwenden',
        reset: 'Zurücksetzen',
      },
      pagination: {
        rangeOfTotal: '{{start}}-{{end}} von {{total}}',
      },
      validation: {
        nameRequired: 'Name ist erforderlich.',
      },
    },
    transactions: {
      titleLatest: 'Alle Transaktionen',
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
      create: {
        open: 'Transaktion hinzufügen',
        title: 'Transaktion hinzufügen',
        save: 'Erstellen',
        cancel: 'Abbrechen',
        success: 'Transaktion wurde erfolgreich erstellt.',
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
      validation: {
        amountNonZero: 'Betrag darf nicht 0 sein.',
      },
    },
  },
} as const

export default de
