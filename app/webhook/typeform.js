require('dotenv').config();
const crypto = require('crypto');

function extractData(typeformObject) {
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

function isValidSignature(signature, payload) {
  const hash = crypto.createHmac('sha256', process.env.TYPEFORM_KEY)
    .update(payload)
    .digest('base64');

  return signature === `sha256=${hash}`;
}

module.exports = {
  extractData,
  isValidSignature
};
