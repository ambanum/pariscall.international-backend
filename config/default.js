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
};
