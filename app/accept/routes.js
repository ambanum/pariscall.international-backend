require('dotenv-safe').config();
const config = require('config');
const express = require('express');
const path = require('path');
const pug = require('pug');
const parseDomain = require('parse-domain');

const mailer = require('../mailer');
const encoder = require('../encoder');
const repository = require('../repository');
const middlewares = require('../middlewares');

const router = express.Router();
const notifySupporterEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/supporter.pug'));
const supporterFileTemplate = pug.compileFile(path.resolve(__dirname, './file-templates/supporter.pug'));
const notifyEventEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/event.pug'));
const eventFileTemplate = pug.compileFile(path.resolve(__dirname, './file-templates/event.pug'));

const categoryNameToType = {
  "Entreprise ou autre acteur privé": "private_sector",
  "État-nation": "state",
  "Organisation de la société civile": "civil_society",
  "Company or other private actor": "private_sector",
  "Nation state": "state",
  "Civil society organization": "civil_society",
}

router.get('/supporter', middlewares.tokenValidation, async (req, res, next) => {
  let data;
  try {
    data = encoder.decode(req.query.token);
  } catch (error) {
    return res.status(403).render('error', {
      title: 'Une erreur est survenue',
      error,
      message: "Il semblerait que le lien d'approbation soit altéré, réessayez de le copier depuis le mail que vous avez reçu."
    });
  }

  const {
    formResponse: {
      name,
      category,
      state,
      confirm_email
    }
  } = data;

  const filename = `${repository.sanitizeName(name.value)}-${repository.sanitizeName(categoryNameToType[category.value])}-${repository.sanitizeName(state.value)}.md`;

  for (const folder of config.repository.supporterDestinationFolders) {
    const path = `${folder}/${filename}`;

    try {
      const response = await repository.createFile({
        path: path,
        commitMessage: `Add ${name.value} supporter`,
        content: supporterFileTemplate({
          name: name.value,
          category: categoryNameToType[category.value],
          nationality: state.value,
          date_signed: new Date(data.date_signed).toISOString().slice(0, 10),
        })
      });
      console.log(`File ${path} properly created: ${response.data && response.data.content.html_url}`);
    } catch (error) {
      let title = 'Une erreur est survenue';
      let message;

      if (error.status === 422 && error.message.includes('sha')) {
        title = `Une erreur est survenue lors de l'ajout du signataire`;
        message = `Il semblerait que "${name.value}" existe déjà.`;
      }

      console.error(error);
      res.status(500).render('error', {
        title,
        message,
        error
      });
    }
  }

  try {
    const {
      messageId
    } = await mailer.sendAsAdministrator({
      to: {
        email: confirm_email.value,
        name: name.value,
      },
      subject: res.__('supporter.notifyEmail.subject'),
      content: notifySupporterEmailTemplate({
        data,
        __: res.__,
        introUrl: `${config.frontend.website}/${req.getLocale()}/supporters`
      })
    });

    console.log(`Notification email sent. See details by logging into SendInBlue logs and search for message id: "${messageId}"`);

    res.render('index', {
      title: `${name.value} correctement ajouté à la liste des signataires`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.response.body);
  }
});

router.get('/event', middlewares.tokenValidation, async (req, res, next) => {
  let data;
  try {
    data = encoder.decode(req.query.token);
  } catch (error) {
    return res.status(403).render('error', {
      title: 'Une erreur est survenue',
      error,
      message: "Il semblerait que le lien d'approbation soit altéré, réessayez de le copier depuis le mail que vous avez reçu."
    });
  }

  const {
    formResponse: {
      name,
      address,
      link,
      start_date,
      end_date,
      description,
      confirm_email
    }
  } = data;

  const filename = `${repository.sanitizeName(name.value)}.md`;
  const path = `${config.repository.eventDestinationFolder}/${filename}`;

  let linkTitle = link && link.value;
  if (link) {
    const parsedLink = parseDomain(link.value);
    if (parsedLink) {
      if (parsedLink.domain) {
        linkTitle = parsedLink.domain;
      }
      if (parsedLink.tld) {
        linkTitle = `${linkTitle}.${parsedLink.tld}`;
      }
      if (parsedLink.subdomain) {
        linkTitle = `${parsedLink.subdomain}.${linkTitle}`;
      }
    }
  }

  try {
    const response = await repository.createFile({
      path: path,
      commitMessage: `Add ${name.value} event`,
      content: eventFileTemplate({
        name: name.value,
        address: address && address.value,
        link: link && link.value,
        link_title: linkTitle,
        start_date: start_date.value,
        end_date: end_date ? end_date.value : start_date.value,
        description: description && description.value,
      }),
    });
    console.log(`File ${path} properly created: ${response.data && response.data.content.html_url}`);
  } catch (error) {
    let title = 'Une erreur est survenue';
    let message;

    if (error.status === 422 && error.message.includes('sha')) {
      title = "Une erreur est survenue lors de l'ajout de l'évènement";
      message = `Il semblerait que "${name.value}" existe déjà.`;
    }

    console.error(error);
    return res.status(500).render('error', {
      title,
      message,
      error
    });
  }

  try {
    const {
      messageId
    } = await mailer.sendAsAdministrator({
      to: {
        email: confirm_email.value,
        name: name.value,
      },
      subject: res.__('event.notifyEmail.subject', name.value),
      content: notifyEventEmailTemplate({
        name: name.value,
        __: res.__,
        introUrl: `${config.frontend.website}/${req.getLocale()}/#events`,
      })
    });

    console.log(`Notification email sent. See details by logging into SendInBlue logs and search for message id: "${messageId}"`);

    res.render('index', {
      title: `${name.value} correctement ajouté aux évènements`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.response.body);
  }
});

module.exports = router;
