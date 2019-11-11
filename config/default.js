module.exports = {
  supportedLanguages: ['en', 'fr'],
  repository: {
    // folder in the destination repository in which events files will be created
    eventDestinationFolder: '_events',
    // folder in the destination repository in which supporter files will be created
    supporterDestinationFolder: '_supporters',
  },
  mailer: {
    nbDaysBeforeTokenExpiration: 7
  },
  crm: {
    // Id taken from SendInBlue contact list (see https://my.sendinblue.com/users/list)
    listsIds: {
      executive: 3,
      newsletter: 4,
    },
    categoriesIds: {
      'private-sector': 1,
      'civil-society': 2,
      'public-authority': 3,
      'state': 4,
    },
    langsIds: {
      fr: 1,
      en: 2,
    }
  }
};
