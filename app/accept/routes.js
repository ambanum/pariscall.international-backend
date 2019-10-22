require('dotenv').config();
const express = require('express');

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

    const { formResponse: { name, category, state }} = data;

    // Sanitize filename
    const filename = `${github.sanitizeName(name.value)}-${github.sanitizeName(category.value)}-${github.sanitizeName(state.value)}.md`;
    const path = `${process.env.REPO_DEST_FOLDER}/${filename}`;

    // Generate file content
    const content = `---
name: ${name.value}
category: ${category.value}
nature:
nationality: ${state.value}
alliance:
date_signed: ${new Date(data.date_signed).toISOString().slice(0,10)}
---
`;

    // Create file on github
    github.createFile({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      path: path,
      commitMessage: `Add ${name.value} supporter`,
      content,
    }).then(() => {
      // Send email to requester
      return mailer.send({
        from: {
          email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME
        },
        to: {
          // TODO use requester name and email
          // email: confirm_email.value
          email: 'lowx512@gmail.com'
        },
        // TODO Add mail content
        subject: 'You are now a supporter of the Paris Call!',
        content: 'Test',
      });
    })
    .then(() => {
      res.render('index', { title: `${name.value} correctement ajouté à la liste des signataires` });
    })
    .catch((error) => {
      let title = `Une erreur est survenue lors de l'ajout de ${name.value} à la liste des signataires`;
      let message = '';

      if (error.status === 422 && error.message.includes('sha')) {
        title = `Une erreur est survenue lors de l'ajout de ${name.value} à la liste des signataires`;
        message = `Il semblerait que ${name.value} soit déjà signataire de l'appel de Paris.`;
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
    console.log(error);
    res.sendStatus(statusCode).render('error', {
      title: `Une erreur est survenue lors de l'ajout d'un signataire à la liste des signataires`,
      error
    });
  };
});

module.exports = router;
