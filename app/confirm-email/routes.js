require('dotenv-safe').config();
const config = require('config');
const express = require('express');
const path = require('path');
const pug = require('pug');

const encoder = require('../encoder');
const mailer = require('../mailer');
const crm = require('../crm');
const transform = require('../transform');
const middlewares = require('../middlewares');

const router = express.Router();
const acceptSupporterEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/accept-supporter.pug'));
const acceptEventEmailTemplate = pug.compileFile(path.resolve(__dirname, './mail-templates/accept-event.pug'));

const ENTITIES = {
  SUPPORTER: 'supporter',
  EVENT: 'event',
};

router.get('/supporter', middlewares.tokenValidation, async (req, res, next) => {
  try {
    handleConfirmEmail(req, res, next, {
      mailTemplate: acceptSupporterEmailTemplate,
      linkUrl: `${config.frontend.api}/accept/supporter`,
      mailSubject: 'ParisCall : nouveau soutien',
      entity: ENTITIES.SUPPORTER,
    });
  } catch (error) {
    res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/supporter/error`);
  }
});

router.get('/event', middlewares.tokenValidation, async (req, res, next) => {
  try {
    handleConfirmEmail(req, res, next, {
      mailTemplate: acceptEventEmailTemplate,
      linkUrl: `${config.frontend.api}/accept/event`,
      mailSubject: 'ParisCall : nouvel évènement',
      entity: ENTITIES.EVENT,
    });
  } catch (error) {
    res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/event/error`);
  }
});

async function handleConfirmEmail(req, res, next, options) {
  let data;
  try {
    data = encoder.decode(req.query.token);
  } catch (error) {
    return res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/${options.entity}/error`);
  }

  const now = new Date();
  const oneWeekAgo = now.setDate(now.getDate() - config.mailer.nbDaysBeforeTokenExpiration);
  const isTokenExpired = new Date(data.date_signed) < oneWeekAgo;
  if (isTokenExpired) {
    return res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/${options.entity}/expired`);
  }

  const reEncodedData = encoder.encode(data);
  const linkUrl = `${options.linkUrl}?lang=${req.getLocale()}&token=${reEncodedData}`;

  if (options.entity === ENTITIES.SUPPORTER) {
    saveSupporterContact(data);
  }

  try {
    const {
      messageId
    } = await mailer.sendAsBot({
      to: {
        email: config.mailer.approver.email,
        name: config.mailer.approver.name,
      },
      subject: options.mailSubject,
      content: options.mailTemplate({
        linkUrl,
        data
      }),
    });

    const message = `Approval email sent. See details by logging into SendInBlue logs and searching for message id: "${messageId}"`;
    console.log(message);
    res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/${options.entity}`);
  } catch (error) {
    console.error(error);
    res.redirect(`${config.frontend.website}/${req.getLocale()}/confirm/${options.entity}/error`);
  }
}

function saveSupporterContact(data) {
  const {
    formResponse: {
      name,
      category,
      nationality,
      confirm_email,
      contact_email,
      website,
      twitter,
      linkedin,
    },
    date_signed,
    lang,
  } = data;

  const categoryName = transform.normalizeCategory(category.value);

  const contactData = {
    category: config.crm.categoriesIds[categoryName],
    name: name.value,
    twitter: twitter && twitter.value,
    linkedin: linkedin && linkedin.value,
    website: website && website.value,
    nationality: transform.normalizeNationality(nationality.value, lang),
    date_signed,
    lang: config.crm.langsIds[lang],
  }

  crm.createOrUpdateExecutiveContact(confirm_email.value, {
    ...contactData,
    approved: false,
  }).catch(error => {
    console.error(error);
    mailer.sendAsBot({
      to: {
        email: config.mailer.approver.email,
        name: config.mailer.approver.name,
      },
      subject: `Erreur d'enregistrement du contact dans la liste 'Responsables' ${config.crm.listsIds.executive}`,
      content: `Le contact ${confirm_email.value} n'a pas pu être enregistré dans la base de contacts de SendInBlue.

Cette erreur est indépendante de l'enregistrement du soutien, pour laquelle vous devriez recevoir un courriel d'approbation dans quelques instants.
La raison la plus probable est une indisponibilité temporaire de l'API de SendInBlue. Afin de maintenir une base de données à jour, il faudra ajouter manuellement le soutien avec toutes les données transmises dans le courriel d'approbation.
`,
    });
  });

  if (contact_email.value) {
    crm.createOrUpdateNewsletterContact(contact_email.value, contactData).catch(error => {
      console.error(error);
      mailer.sendAsBot({
        to: {
          email: config.mailer.approver.email,
          name: config.mailer.approver.name,
        },
        subject: `Erreur d'enregistrement du contact dans la liste 'Newsletter' (id: ${config.crm.listsIds.newsletter}`,
        content: `Le contact ${confirm_email.value} n'a pas pu être enregistré dans la base de contacts de SendInBlue.

  Cette erreur est indépendante de l'enregistrement du soutien, pour laquelle vous devriez recevoir un courriel d'approbation dans quelques instants.
  La raison la plus probable est une indisponibilité temporaire de l'API de SendInBlue. Afin de maintenir une base de données à jour, il faudra ajouter manuellement le soutien avec toutes les données transmises dans le courriel d'approbation.
  `,
      });
    });
  }
}

module.exports = router;
