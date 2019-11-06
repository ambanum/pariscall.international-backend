const supportedLanguages = ['en', 'fr'];

module.exports = {
  repository: {
    // folder in the destination repository in which events files will be created
    eventDestinationFolder: '_events',
    // folder in the destination repository in which supporter files will be created
    supporterDestinationFolders: supportedLanguages.map((lang) => `_supporters_${lang}`),
  },
  mailer: {
    nbDaysBeforeTokenExpiration: 7
  },
  frontend: {
    supportedLanguages,
  },
};
