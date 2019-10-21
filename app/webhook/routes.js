require('dotenv').config();
const express = require('express');
const path = require('path');
const pug = require('pug');
const crypto = require('crypto');

const { encode } = require('../encoder');
const { send } = require('../mailer');

const router = express.Router();
const mailTemplate = pug.compileFile(path.resolve(__dirname, './mail-template.pug'));

router.post('/', async (req, res, next) => {
  const typeformSignature = req.headers['typeform-signature'];

  if (!typeformSignature || !isValidTypeformSignature(typeformSignature, req.body)) {
    return res.sendStatus(403);
  }

  // Convert body buffer to string and parse it in JSON
  const { form_response } = JSON.parse(req.body.toString('utf8'));

  const data = {
    formResponse: extractDataFromTypeform(form_response),
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

function extractDataFromTypeform(typeformObject) {
  const { definition, answers } = typeformObject;
  const result = {};

  answers.forEach((answer) => {
    const fieldId = answer.field.id;
    const question = definition.fields.find(field => field.id === fieldId);

    result[question.ref] = {
      title: question.title,
    };

    switch (question.type) {
      case 'multiple_choice':
        result[question.ref].value = answer.choice.label
        break;
      case 'short_text':
        result[question.ref].value = answer.text;
        break;
      case 'website':
        result[question.ref].value = answer.url;
        break;
      case 'email':
        result[question.ref].value = answer.email;
        break;
    }
  });

  return result;
}

function isValidTypeformSignature(signature, payload) {
  const hash = crypto.createHmac('sha256', process.env.TYPEFORM_KEY)
    .update(payload)
    .digest('base64');

  return signature === `sha256=${hash}`;
}

module.exports = router;
