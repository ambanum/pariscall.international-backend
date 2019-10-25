const express = require('express');
const path = require('path');
const pug = require('pug');

const encoder = require('../encoder');
const mailer = require('../mailer');

const router = express.Router();
const acceptSupporterEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/accept-supporter.pug'));
const acceptEventEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/accept-event.pug'));

const NB_DAYS_BEFORE_EXPIRATION = 7;

router.get('/supporter', tokenValidationMiddleware, async (req, res, next) => {
  try {
    handleConfirmEmail(req, res, next, {
      mailTemplate: acceptSupporterEmailTemplate,
      linkUrl: `${process.env.PARIS_CALL_API_URL}/accept/supporter`,
      mailSubject: 'ParisCall : nouveau signataire',
    });
  } catch (error) {
    res.redirect(`${process.env.PARIS_CALL_WEBSITE}/confirm/error`);
  }
});

router.get('/event', tokenValidationMiddleware, async (req, res, next) => {
  try {
    handleConfirmEmail(req, res, next, {
      mailTemplate: acceptEventEmailTemplate,
      linkUrl: `${process.env.PARIS_CALL_API_URL}/accept/event`,
      mailSubject: 'ParisCall : nouvel évènement',
    });
  } catch (error) {
    res.redirect(`${process.env.PARIS_CALL_WEBSITE}/confirm/error`);
  }
});

function handleConfirmEmail(req, res, next, options) {
  const data = encoder.decode(req.query.token);

  const now = new Date();
  const oneWeekAgo = now.setDate(now.getDate() - NB_DAYS_BEFORE_EXPIRATION);
  const isTokenExpired = new Date(data.date_signed) < oneWeekAgo;
  if (isTokenExpired) {
    return res.redirect(`${process.env.PARIS_CALL_WEBSITE}/confirm/expired`);
  }

  const reEncodedData = encoder.encode(data);
  const linkUrl = `${options.linkUrl}?token=${reEncodedData}`;

  mailer.sendAsBot({
    to: {
      email: process.env.APPROBATOR_EMAIL,
    },
    subject: options.mailSubject,
    content: options.mailTemplate({ linkUrl, data }),
  }).then(() => {
    res.redirect(`${process.env.PARIS_CALL_WEBSITE}/confirm`);
  }).catch(() => {
    res.redirect(`${process.env.PARIS_CALL_WEBSITE}/confirm/error`);
  });
}

function tokenValidationMiddleware(req, res, next) {
  const encodedData = req.query.token;
  if (!encodedData) {
    return res.sendStatus(403);
  }

  next();
}

module.exports = router;
