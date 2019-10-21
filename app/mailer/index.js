require('dotenv').config();
const striptags = require('striptags');
const mailjet = require('node-mailjet').connect(process.env.MAILJET_APIKEY_PUBLIC, process.env.MAILJET_APIKEY_PRIVATE);

function send(options) {
  const request = mailjet.post("send", {
      'version': 'v3.1'
    })
    .request({
      "Messages": [{
        "From": {
          "Email": options.from.email,
          "Name": options.from.name
        },
        "To": [{
          "Email": options.to.email,
          "Name": options.to.name
        }],
        "Subject": options.subject,
        "TextPart": striptags(options.content),
        "HTMLPart": options.content,
      }]
    });

  return request;
}

module.exports = {
  send,
};
