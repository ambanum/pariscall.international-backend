require('dotenv').config();
const express = require('express');
const path = require('path');
const pug = require('pug');

const mailer = require('../mailer');
const encoder = require('../encoder');
const repository = require('../repository');

const router = express.Router();
const notifySupporterEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/supporter.pug'));
const supporterFileTemplate = pug.compileFile(path.resolve(__dirname, './file-templates/supporter.pug'));
const notifyEventEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/event.pug'));
const eventFileTemplate = pug.compileFile(path.resolve(__dirname, './file-templates/event.pug'));

router.get('/supporter', tokenValidationMiddleware, async (req, res, next) => {
  let entityName;
  try {
    const data = encoder.decode(req.query.token);

    const { formResponse: { name, category, state, confirm_email } } = data;
    entityName = name.value;

    const filename = `${repository.sanitizeName(name.value)}-${repository.sanitizeName(category.value)}-${repository.sanitizeName(state.value)}.md`;
    const path = `${process.env.REPO_SUPPORTER_DEST_FOLDER}/${filename}`;

    await repository.createFile({
      path: path,
      commitMessage: `Add ${name.value} supporter`,
      content: supporterFileTemplate({ data })
    });

    await mailer.sendAsAdministrator({
      to: {
        email: confirm_email.value
      },
      subject: 'You are now a supporter of the Paris Call!',
      content: notifySupporterEmailTemplate({ data })
    });

    res.render('index', { title: `${entityName} correctement ajouté à la liste des signataires` });
  } catch (error) {
    errorsHandler(req, res, next, error, { entityName });
  };
});

router.get('/event', tokenValidationMiddleware, async (req, res, next) => {
  let entityName;
  try {
    const data = encoder.decode(req.query.token);

    const { formResponse: { name, confirm_email } } = data;
    entityName = name.value;

    const filename = `${repository.sanitizeName(name.value)}.md`;
    const path = `${process.env.REPO_EVENT_DEST_FOLDER}/${filename}`;

    await repository.createFile({
      path: path,
      commitMessage: `Add ${name.value} event`,
      content: eventFileTemplate({ data }),
    });

    await mailer.sendAsAdministrator({
      to: {
        email: confirm_email.value
      },
      subject: 'Your event is accepted',
      content: notifyEventEmailTemplate({ data })
    });

    res.render('index', {
      title: `${entityName} correctement ajouté aux évènements`
    });
  } catch (error) {
    errorsHandler(req, res, next, error, { entityName });
  };
});

function tokenValidationMiddleware(req, res, next) {
  const encodedData = req.query.token;
  if (!encodedData) {
    return res.sendStatus(403);
  }

  next();
}

function errorsHandler(req, res, next, error, options) {
  let statusCode = error.status || 500;
  let message = error.message;

  if (error.status === 422 && error.message.includes('sha')) {
    title = `Une erreur est survenue lors de l'ajout de ${options.entityName}`;
    message = `Il semblerait que ${options.entityName} existe déjà.`;
  }

  if (error.message.includes('failed to decrypt')) {
    statusCode = 403;
  }

  res.status(statusCode).render('error', {
    title: `Une erreur est survenue`,
    error,
    message
  });
}

module.exports = router;
