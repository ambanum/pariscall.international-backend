require('dotenv').config();
const config = require('config');
const express = require('express');
const path = require('path');
const pug = require('pug');

const encoder = require('../encoder');
const mailer = require('../mailer');
const middlewares = require('../middlewares');

const router = express.Router();
const acceptSupporterEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/accept-supporter.pug'));
const acceptEventEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/accept-event.pug'));

router.get('/supporter', middlewares.tokenValidation, async (req, res, next) => {
  try {
    handleConfirmEmail(req, res, next, {
      mailTemplate: acceptSupporterEmailTemplate,
      linkUrl: `${config.frontend.api}/accept/supporter`,
      mailSubject: 'ParisCall : nouveau signataire',
      entity: 'supporter',
    });
  } catch (error) {
    res.redirect(`${config.frontend.website}/en/confirm/supporter/error`);
  }
});

router.get('/event', middlewares.tokenValidation, async (req, res, next) => {
  try {
    handleConfirmEmail(req, res, next, {
      mailTemplate: acceptEventEmailTemplate,
      linkUrl: `${config.frontend.api}/accept/event`,
      mailSubject: 'ParisCall : nouvel évènement',
      entity: 'event',
    });
  } catch (error) {
    res.redirect(`${config.frontend.website}/en/confirm/event/error`);
  }
});

function handleConfirmEmail(req, res, next, options) {
  const data = encoder.decode(req.query.token);

  const now = new Date();
  const oneWeekAgo = now.setDate(now.getDate() - config.mailer.nbDaysBeforeTokenExpiration);
  const isTokenExpired = new Date(data.date_signed) < oneWeekAgo;
  if (isTokenExpired) {
    return res.redirect(`${config.frontend.website}/en/confirm/${options.entity}/expired`);
  }

  const reEncodedData = encoder.encode(data);
  const linkUrl = `${options.linkUrl}?token=${reEncodedData}`;

  mailer.sendAsBot({
    to: {
      email: config.mailer.approver.email,
      name: config.mailer.approver.name,
    },
    subject: options.mailSubject,
    content: options.mailTemplate({ linkUrl, data }),
  }).then(() => {
    res.redirect(`${config.frontend.website}/en/confirm/${options.entity}`);
  }).catch(() => {
    res.redirect(`${config.frontend.website}/en/confirm/${options.entity}/error`);
  });
}

module.exports = router;
