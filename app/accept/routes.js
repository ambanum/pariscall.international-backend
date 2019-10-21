require('dotenv').config();
const express = require('express');
const sanitize = require('sanitize-filename');
const changeCase = require('change-case');
const diacritics = require('diacritics');
const { decode } = require('../encoder');
const { createFile } = require('../github');

const router = express.Router();

router.get('/', async (req, res, next) => {
  const encodedData = req.query.token;
  if (!encodedData) {
    return res.sendStatus(403);
  }

  const data = decode(encodedData);
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
  createFile({
    owner: process.env.REPO_OWNER,
    repo: process.env.REPO_NAME,
    path: path,
    commitMessage: `Add ${data.formResponse.name.value} supporter`,
    content,
  }).then(() => {
    res.render('index', { title: `${data.formResponse.name.value} correctement ajouté à la liste des signataire` });
  }).catch((error) => {
    if (error.status === 422 && error.message.includes('sha')) {
      return res.render('error', {
        title: `Une erreur est survenue lors de l'ajout de ${data.formResponse.name.value} à la liste des signataires`,
        message: `Il semblerait que ${data.formResponse.name.value} soit déjà signataire de l'appel de Paris.`,
        error
      });
    }

    res.render('error', {
      title: `Une erreur est survenue lors de l'ajout de ${data.formResponse.name.value} à la liste des signataires`,
      error
    });
  });
});

module.exports = router;
