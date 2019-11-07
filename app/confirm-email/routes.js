require('dotenv-safe').config();
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
    res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/supporter/error`);
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
    res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/event/error`);
  }
});

async function handleConfirmEmail(req, res, next, options) {
  let data;
  try {
    data = encoder.decode(req.query.token);
  } catch (error) {
    return res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/${options.entity}/error`);
  }

  const now = new Date();
  const oneWeekAgo = now.setDate(now.getDate() - config.mailer.nbDaysBeforeTokenExpiration);
  const isTokenExpired = new Date(data.date_signed) < oneWeekAgo;
  if (isTokenExpired) {
    return res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/${options.entity}/expired`);
  }

  const reEncodedData = encoder.encode(data);
  const linkUrl = `${options.linkUrl}?lang=${req.getLocale()}&token=${reEncodedData}`;

  try {
    const {
      messageId
    } = await mailer.sendAsBot({
      to: {
        email: config.mailer.approver.email,
        name: config.mailer.approver.name,
      },
      subject: options.mailSubject,
      content: options.mailTemplate({
        linkUrl,
        data
      }),
    });

    const message = `Approval email sent. See details by logging into SendInBlue logs and searching for message id: "${messageId}"`;
    console.log(message);
    res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/${options.entity}`);
  } catch (error) {
    console.error(error);
    res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/${options.entity}/error`);
  }
}

module.exports = router;
