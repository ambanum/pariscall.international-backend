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
      name: 'Paris Call Approver',
    },
    // sender email for confirmation emails
    administrator: {
      name: 'Paris Call',
      email: 'npg.dupont@gmail.com',
    },
    // sender email for approbation emails
    bot: {
      name: 'Paris Call Bot',
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
