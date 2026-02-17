const de = {
  translation: {
    common: {
      page: 'Seite',
    },
    errors: {
      accountsLoad: 'Konten konnten nicht geladen werden.',
      accountCreate: 'Konto konnte nicht erstellt werden.',
      accountUpdate: 'Konto konnte nicht gespeichert werden.',
      accountDelete: 'Konto konnte nicht archiviert werden.',
      settingsLoad: 'Einstellungen konnten nicht geladen werden.',
      categoriesLoad: 'Kategorien konnten nicht geladen werden.',
      categoryCreate: 'Kategorie konnte nicht erstellt werden.',
      categoryUpdate: 'Kategorie konnte nicht gespeichert werden.',
      categoryDelete: 'Kategorie konnte nicht archiviert werden.',
      transactionsLoad: 'Transaktionen konnten nicht geladen werden.',
      transactionCreate: 'Transaktion konnte nicht erstellt werden.',
      transactionUpdate: 'Transaktion konnte nicht gespeichert werden.',
      transactionDelete: 'Transaktion konnte nicht archiviert werden.',
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
        balance: 'Kontostand',
        createdAt: 'Erstellt am',
      },
      actions: {
        edit: 'Konto bearbeiten',
        delete: 'Konto archivieren',
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
        confirmTitle: 'Konto archivieren?',
        confirmDescription: 'Möchtest du dieses Konto wirklich archivieren?',
        cascadeWarning:
          'Beim Archivieren eines Kontos werden auch alle damit verbundenen Transaktionen archiviert!',
        confirm: 'Archivieren',
        cancel: 'Abbrechen',
        success: 'Konto wurde erfolgreich archiviert.',
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
        delete: 'Kategorie archivieren',
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
        confirmTitle: 'Kategorie archivieren?',
        confirmDescription: 'Möchtest du diese Kategorie wirklich archivieren?',
        confirm: 'Archivieren',
        cancel: 'Abbrechen',
        success: 'Kategorie wurde erfolgreich archiviert.',
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
        type: 'Typ',
        bookedOn: 'Buchungsdatum',
        amount: 'Betrag',
        merchant: 'Transaktionspartner',
      },
      actions: {
        edit: 'Transaktion bearbeiten',
        delete: 'Transaktion archivieren',
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
        confirmTitle: 'Transaktion archivieren?',
        confirmDescription: 'Möchtest du diese Transaktion wirklich archivieren?',
        confirm: 'Archivieren',
        cancel: 'Abbrechen',
        success: 'Transaktion wurde erfolgreich archiviert.',
      },
      filters: {
        note: 'Beschreibung',
        account: 'Konto',
        category: 'Kategorie',
        type: 'Typ',
        bookedFrom: 'Buchung von',
        bookedTo: 'Buchung bis',
        minAmount: 'Betrag min',
        maxAmount: 'Betrag max',
        apply: 'Anwenden',
        reset: 'Zurücksetzen',
      },
      type: {
        income: 'Einnahme',
        expense: 'Ausgabe',
      },
      pagination: {
        rangeOfTotal: '{{start}}-{{end}} von {{total}}',
      },
      validation: {
        amountNonZero: 'Betrag darf nicht 0 sein.',
      },
    },
    settings: {
      title: 'Einstellungen',
      actions: {
        save: 'Speichern',
        reset: 'Zurücksetzen',
      },
      messages: {
        updated: 'Einstellungen gespeichert.',
      },
      resetConfirm: {
        title: 'Änderungen zurücksetzen?',
        description:
          'Möchtest du deine Änderungen wirklich verwerfen und die gespeicherten Einstellungen wiederherstellen?',
        confirm: 'Zurücksetzen',
        cancel: 'Abbrechen',
      },
      currency: {
        title: 'Standardwährung',
        description: 'Wähle die Währung, die für alle Konten, Transaktionen und Kategorien gilt.',
        label: 'Währung',
        required: 'Bitte eine Währung auswählen.',
        appliesGlobally: 'Gilt für alle Salden und Buchungen.',
      },
    },
  },
} as const

export default de
