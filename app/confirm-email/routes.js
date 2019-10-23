const express = require('express');
const path = require('path');
const pug = require('pug');

const encoder = require('../encoder');
const mailer = require('../mailer');

const router = express.Router();
const mailTemplate = pug.compileFile(path.resolve(__dirname, './mail-template.pug'));
const NB_DAYS_BEFORE_EXPIRATION = 7;

router.get('/', async (req, res, next) => {
  try {
    const encodedData = req.query.token;
    if (!encodedData) {
      return res.sendStatus(403);
    }

    const data = encoder.decode(encodedData);
    if (!data.formResponse) {
      return res.sendStatus(403);
    }

    // Check if link is expired
    const now = new Date();
    const oneWeekAgo = now.setDate(now.getDate() - NB_DAYS_BEFORE_EXPIRATION);
    if (new Date(data.date_signed) < oneWeekAgo) {
      return res.redirect(`${process.env.PARIS_CALL_WEBSITE}/confirm/expired`);
    }

    const reEncodedData = encoder.encode(data);

    const linkUrl = `${process.env.PARIS_CALL_API_URL}/accept?token=${reEncodedData}`;
    const mailContent = mailTemplate({
      linkUrl,
      data,
    });

    mailer.send({
      from: {
        email: process.env.BOT_EMAIL,
        name: process.env.BOT_NAME
      },
      to: {
        email: process.env.APPROBATOR_EMAIL,
      },
      subject: `ParisCall: nouveau signataire ${data.formResponse.name.value}`,
      content: mailContent,
    }).then(() => {
      res.redirect(`${process.env.PARIS_CALL_WEBSITE}/confirm`);
    }).catch((error) => {
      res.redirect(`${process.env.PARIS_CALL_WEBSITE}/confirm/error`);
    });
  } catch (error) {
    res.redirect(`${process.env.PARIS_CALL_WEBSITE}/confirm/error`);
  }
});

module.exports = router;
