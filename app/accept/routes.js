require('dotenv').config();
const express = require('express');
const sanitize = require('sanitize-filename');
const changeCase = require('change-case');
const diacritics = require('diacritics');

const mailer = require('../mailer');
const encoder = require('../encoder');
const github = require('../github');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const encodedData = req.query.token;
    if (!encodedData) {
      return res.sendStatus(403);
    }

    const data = encoder.decode(encodedData);
    if (!data.formResponse) {
      return  res.sendStatus(403);
    }

    // Sanitize filename
    const filename = `${diacritics.remove(changeCase.snakeCase(sanitize(data.formResponse.name.value)))}.md`;
    const path = `${process.env.REPO_DEST_FOLDER}/${filename}`;

    // Generate file content
    const content = `---
name: ${data.formResponse.name.value}
category: ${data.formResponse.category.value}
nature:
nationality: ${data.formResponse.state.value}
alliance:
date_signed: ${new Date(data.date_signed).toISOString().slice(0,10)}
---
`;

    // Create file on github
    github.createFile({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      path: path,
      commitMessage: `Add ${data.formResponse.name.value} supporter`,
      content,
    }).then(() => {
      // Send email to requester
      mailer.send({
        from: {
          email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME
        },
        to: {
          // TODO use requester name and email
          // email: data.formResponse.confirm_email.value
          email: 'lowx512@gmail.com'
        },
        // TODO Add mail content
        subject: 'You are now a supporter of the Paris Call!',
        content: '',
      });

      res.render('index', { title: `${data.formResponse.name.value} correctement ajouté à la liste des signataires` });
    }).catch((error) => {
      let title = `Une erreur est survenue lors de l'ajout de ${data.formResponse.name.value} à la liste des signataires`;
      let message = '';

      if (error.status === 422 && error.message.includes('sha')) {
        title = `Une erreur est survenue lors de l'ajout de ${data.formResponse.name.value} à la liste des signataires`;
        message = `Il semblerait que ${data.formResponse.name.value} soit déjà signataire de l'appel de Paris.`;
      }

      res.render('error', {
        title,
        message,
        error,
      });
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('failed to decrypt')) {
      statusCode = 403;
    }

    res.sendStatus(statusCode).render('error', {
      title: `Une erreur est survenue lors de l'ajout d'un signataire à la liste des signataires`,
      error
    });
  };
});

module.exports = router;
