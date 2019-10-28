
require('dotenv').config();
const config = require('config');
const express = require('express');
const path = require('path');
const pug = require('pug');
const parseDomain = require('parse-domain');

const mailer = require('../mailer');
const encoder = require('../encoder');
const repository = require('../repository');

const router = express.Router();
const notifySupporterEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/supporter.pug'));
const supporterFileTemplate = pug.compileFile(path.resolve(__dirname, './file-templates/supporter.pug'));
const notifyEventEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/event.pug'));
const eventFileTemplate = pug.compileFile(path.resolve(__dirname, './file-templates/event.pug'));

const categoryNameToType = {
  "Secteur privé": "private_sector",
  "État": "state",
  "Société civile": "civil_society",
}

router.get('/supporter', tokenValidationMiddleware, async (req, res, next) => {
  let entityName;
  try {
    const data = encoder.decode(req.query.token);

    const { formResponse: { name, category, state, confirm_email } } = data;
    entityName = name.value;

    const filename = `${repository.sanitizeName(name.value)}-${repository.sanitizeName(categoryNameToType[category.value])}-${repository.sanitizeName(state.value)}.md`;

    for (const folder of config.repository.supporterDestinationFolders) {
      const path = `${folder}/${filename}`;

      await repository.createFile({
        path: path,
        commitMessage: `Add ${name.value} supporter`,
        content: supporterFileTemplate({
          name: data.formResponse.name.value,
          category: categoryNameToType[data.formResponse.category.value],
          nationality: data.formResponse.state.value,
          date_signed: new Date(data.date_signed).toISOString().slice(0,10),
        })
      });
    }

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

    const { formResponse: { name, address, link, start_date, end_date, description, confirm_email } } = data;
    entityName = name.value;

    const filename = `${repository.sanitizeName(name.value)}.md`;
    const path = `${config.repository.eventDestinationFolder}/${filename}`;

    const parsedLink = parseDomain(link.value);

    await repository.createFile({
      path: path,
      commitMessage: `Add ${name.value} event`,
      content: eventFileTemplate({
        name: name.value,
        address: address && address.value,
        link: link && link.value,
        link_title: link && `${parsedLink.subdomain}.${parsedLink.domain}.${parsedLink.tld}`,
        start_date: start_date.value,
        end_date: end_date ? end_date.value : start_date.value,
        description: description && description.value,
      }),
    });

    await mailer.sendAsAdministrator({
      to: {
        email: confirm_email.value
      },
      subject: `Event ${name.value} is approved`,
      content: notifyEventEmailTemplate({
        name: name.value
      })
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
    message = `Il semblerait que le lien d'approbation soit altéré, réessayez de le copier depuis le mail que vous avez reçu.`;
  }

  res.status(statusCode).render('error', {
    title: `Une erreur est survenue`,
    error,
    message
  });
}

module.exports = router;
