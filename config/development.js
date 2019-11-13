module.exports = {
  repository: {
    // GitHub user of the destination repository
    owner: 'Ndpnt',
    // destination repository name
    name: 'test',
  },
  mailer: {
    // recipient for approbation emails
    approver: {
      email: 'npg.dupont@gmail.com',
    },
    // sender email for confirmation emails
    administrator: {
      email: 'npg.dupont@gmail.com',
    },
    // sender email for approbation emails
    bot: {
      email: 'npg.dupont@gmail.com',
    },
  },
  frontend: {
    // URL to redirect user to after email is confirmed
    website: 'http://localhost:4000',
    // URL of this server
    api: 'http://localhost:3000',
  },
};
