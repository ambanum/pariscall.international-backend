require('dotenv-safe').config();
const config = require('config');
const striptags = require('striptags');

const sendInBlue = require('sib-api-v3-sdk');
var defaultClient = sendInBlue.ApiClient.instance;

var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';

var apiInstance = new sendInBlue.SMTPApi();

function sendAsBot(options) {
  const augmentedOptions = {
    from: {
      email: config.mailer.bot.email,
      name: config.mailer.bot.name
    },
    ...options
  }
  return send(augmentedOptions);
}

function sendAsAdministrator(options) {
  const augmentedOptions = {
    from: {
      email: config.mailer.administrator.email,
      name: config.mailer.administrator.name
    },
    ...options
  }
  return send(augmentedOptions);
}

function send(options) {
  return apiInstance.sendTransacEmail({
    sender: {
      email: options.from.email,
      name: options.from.name
    },
    to: [{
      email: options.to.email,
      name: options.to.name || ''
    }],
    subject: options.subject,
    textContent: striptags(options.content),
    htmlContent: options.content,
  });
}

module.exports = {
  sendAsBot,
  sendAsAdministrator,
  send,
};
