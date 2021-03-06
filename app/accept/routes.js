require('dotenv-safe').config();
const config = require('config');
const express = require('express');
const path = require('path');
const pug = require('pug');
const parseDomain = require('parse-domain');
const crypto = require('crypto');

const mailer = require('../mailer');
const encoder = require('../encoder');
const repository = require('../repository');
const middlewares = require('../middlewares');
const transform = require('../transform');
const crm = require('../crm');

const router = express.Router();
const notifySupporterEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/supporter.pug'));
const supporterFileTemplate = pug.compileFile(path.resolve(__dirname, './file-templates/supporter.pug'));
const notifyEventEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/event.pug'));
const eventFileTemplate = pug.compileFile(path.resolve(__dirname, './file-templates/event.pug'));


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
      nationality,
      confirm_email,
      introduction,
      website,
      twitter,
      linkedin,
    },
    lang
  } = data;

  const categoryName = transform.normalizeCategory(category.value);
  const nationalityCode = transform.normalizeNationality(nationality.value, lang);
  const organisationName = (name || nationality).value;
  const filename = `${repository.sanitizeName(organisationName)}-${categoryName}-${nationalityCode}.md`;

  try {
    const path = `${config.repository.supporterDestinationFolder}/${filename}`;
    const response = await repository.createFile({
      path: path,
      commitMessage: `Add ${organisationName} supporter`,
      content: supporterFileTemplate({
        name: organisationName,
        category: categoryName,
        nationality: nationalityCode,
        introduction: introduction && introduction.value,
        website: website && website.value || '',
        twitter: twitter && twitter.value,
        linkedin: linkedin && linkedin.value || '',
        date_signed: new Date(data.date_signed).toISOString().slice(0, 10),
      }),
    });
    console.log(`File ${path} properly created: ${response.data && response.data.content.html_url}`);
  } catch (error) {
    let title = 'Une erreur est survenue';
    let message;

    if (error.status === 422 && error.message.includes('sha')) {
      title = "Une erreur est survenue lors de l'ajout du soutien";
      message = `Il semblerait que "${organisationName}" existe déjà.`;
    }

    console.error(error);
    return res.status(500).render('error', {
      title,
      message,
      error
    });
  }

  crm.createOrUpdateExecutiveContact(confirm_email.value, {
    approved: true,
  }).catch(error => {
    console.error(error);
    mailer.sendAsBot({
      to: {
        email: config.mailer.approver.email,
        name: config.mailer.approver.name,
      },
      subject: "Erreur de mise à jour du contact",
      content: `Le contact ${confirm_email.value} n'a pas pu être mis à jour dans la base de contacts de SendInBlue.

Cette erreur est indépendante de l'approbation du soutien qui à bien été effectuée.
La raison la plus probable est une indisponibilité temporaire de l'API de SendInBlue. Afin de maintenir une base de données à jour, il faudra modifier la visibilité du soutien dans la base de données en changeant la valeur de 'PUBLIQUEMENT_VISIBLE' à 'Yes'.
`,
    });
  });

  try {
    const {
      messageId
    } = await mailer.sendAsAdministrator({
      to: {
        email: confirm_email.value,
        name: res.__('parisCallSupporter'),
      },
      subject: res.__('supporter.notifyEmail.subject'),
      content: notifySupporterEmailTemplate({
        data,
        __: res.__,
      })
    });

    console.log(`Notification email sent. See details by logging into SendInBlue logs and searching for message id: "${messageId}"`);

    res.render('index', {
      title: `${organisationName} correctement ajouté à la liste des soutiens`
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
      confirm_email,
      hashtag,
      openness_level,
    }
  } = data;

  const date = new Date (start_date.value).toISOString().slice(0, 10);
  const addressChecksum = crypto.createHash('sha256').update(address.value).digest("hex").slice(0, 7);
  const filename = `${repository.sanitizeName(name.value).slice(0, 70)}-${date}-${addressChecksum}.md`;
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
        address: address && address.value || '',
        link: link && link.value || '',
        link_title: linkTitle,
        start_date: start_date.value,
        end_date: end_date ? end_date.value : start_date.value,
        description: description && description.value,
        hashtag: hashtag && hashtag.value,
        openness_level: openness_level && transform.normalizeOpennessLevel(openness_level.value),
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
        name: res.__('parisCallSupporter'),
      },
      subject: res.__('event.notifyEmail.subject', name.value),
      content: notifyEventEmailTemplate({
        name: name.value,
        __: res.__,
      })
    });

    console.log(`Notification email sent. See details by logging into SendInBlue logs and searching for message id: "${messageId}"`);

    res.render('index', {
      title: `${name.value} correctement ajouté aux évènements`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.response.body);
  }
});

module.exports = router;
