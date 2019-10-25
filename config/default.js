const supportedLanguages = ['en', 'fr'];

module.exports = {
  repository: {
    eventDestinationFolder: '_events',
    supporterDestinationFolders: supportedLanguages.map((lang) => `_supporters_${lang}`),
  },
  mailer: {
    nbDaysBeforeTokenExpiration: 7
  },
  frontend: {
    supportedLanguages,
  },
};
