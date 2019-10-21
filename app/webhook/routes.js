require('dotenv').config();
const express = require('express');
const path = require('path');
const pug = require('pug');

const { encode } = require('../encoder');
const { send } = require('../mailer');
const typeform = require('./typeform');

const router = express.Router();
const mailTemplate = pug.compileFile(path.resolve(__dirname, './mail-template.pug'));

router.post('/', async (req, res, next) => {
  const typeformSignature = req.headers['typeform-signature'];

  if (!typeformSignature || !typeform.isValidSignature(typeformSignature, req.body)) {
    return res.sendStatus(403);
  }

  // Convert body buffer to string and parse it in JSON
  const { form_response } = JSON.parse(req.body.toString('utf8'));

  const data = {
    formResponse: typeform.extractData(form_response),
    date_signed: new Date().toISOString(),
  }

  // encrypt data
  const encodedData = encode(data);

  const linkUrl = `${req.protocol}://${req.get('host')}/confirm-email?token=${encodedData}`;
  const mailContent = mailTemplate({
    linkUrl,
    data,
  });

  // Send email to requester
  send({
    from: {
      email: process.env.SENDER_EMAIL,
      name: process.env.SENDER_NAME
    },
    to: {
      // TODO use requester name and email
      email: 'lowx512@gmail.com',
      name: 'Nicolas Dupont'
    },
    subject: 'Verify your email',
    content: mailContent,
  }).then(() => {
    res.sendStatus(200);
  }).catch((error) => {
    console.log(error);
    res.sendStatus(500);
  });
});

module.exports = router;
