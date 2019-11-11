const config = require('config');
const sendInBlue = require('sib-api-v3-sdk');
const defaultClient = sendInBlue.ApiClient.instance;

const authentication = defaultClient.authentications['api-key'];
authentication.apiKey = process.env.SENDINBLUE_API_KEY;

const contactsApi = new sendInBlue.ContactsApi();

function createOrUpdateExecutiveContact(email, data) {
  return createOrUpdateContact(config.crm.listsIds.executive, email, data);
}

function createOrUpdateNewsletterContact(email, data) {
  return createOrUpdateContact(config.crm.listsIds.newsletter, email, data);
}

function createOrUpdateContact(listId, email, data) {
  return contactsApi.createContact({
    email: email,
    attributes: {
      NOM: data.firstName,
      PRENOM: data.lastName,
      CATEGORIE: data.category,
      NOM_ORGANISATION: data.name,
      TWITTER: data.twitter,
      LINKEDIN: data.linkedin,
      SITE_WEB: data.website,
      NATIONALITE: data.nationality,
      DATE_SOUTIEN: data.date_signed,
      LANGUE: data.lang,
      PUBLIQUEMENT_VISIBLE: !!data.approved,
    },
    listIds: [listId],
    // Needed even for creation, otherwise SendInBlue API complains of duplicated contact
    updateEnabled: true,
  });
};

module.exports = {
  createOrUpdateExecutiveContact,
  createOrUpdateNewsletterContact,
};
