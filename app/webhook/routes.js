require('dotenv-safe').config();
const config = require('config');
const express = require('express');
const path = require('path');
const pug = require('pug');

const encoder = require('../encoder');
const mailer = require('../mailer');
const typeform = require('./typeform');
const router = express.Router();

const confirmSupporterEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/confirm-supporter.pug'));
const confirmEventEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/confirm-event.pug'));

router.post('/supporter', async (req, res, next) => {
  handleWebhook(req, res, next, {
    mailTemplate: confirmSupporterEmailTemplate,
    linkUrl: `${config.frontend.api}/confirm-email/supporter`,
    mailSubject: res.__('supporter.confirmEmail.subject'),
    urlSuffix: 'support',
  });
});

router.post('/event', async (req, res, next) => {
  handleWebhook(req, res, next, {
    mailTemplate: confirmEventEmailTemplate,
    linkUrl: `${config.frontend.api}/confirm-email/event`,
    mailSubject: res.__('event.confirmEmail.subject'),
    urlSuffix: '#events',
  });
});

function handleWebhook(req, res, next, options) {
  const typeformSignature = req.headers['typeform-signature'];

  if (!typeformSignature || !typeform.isValidSignature(typeformSignature, req.body)) {
    return res.sendStatus(403);
  }

  // Convert body buffer to string and parse it in JSON
  const { form_response } = JSON.parse(req.body.toString('utf8'));

  const data = {
    formResponse: typeform.extractData(form_response),
    date_signed: new Date().toISOString(),
    lang: req.getLocale(),
  }

  const encodedData = encoder.encode(data);

  const linkUrl = `${options.linkUrl}?lang=${req.getLocale()}&token=${encodedData}`;
  const mailContent = options.mailTemplate({
    linkUrl,
    data,
    __: res.__,
    introUrl: `${config.frontend.website}/${req.getLocale()}/${options.urlSuffix}`,
    cancelUrl: `${config.frontend.website}/${req.getLocale()}/${options.urlSuffix}`,
    detailsUrl: `${config.frontend.website}/${req.getLocale()}/supporters`,
  });

  mailer.sendAsAdministrator({
    to: {
      email: data.formResponse.confirm_email.value,
      name: data.formResponse.name.value
    },
    subject: options.mailSubject,
    content: mailContent,
  }).then(() => {
    res.sendStatus(200);
  }).catch((error) => {
    res.sendStatus(500);
  });
}

module.exports = router;
