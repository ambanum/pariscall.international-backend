require('dotenv-safe').config();
const crypto = require('crypto');

function extractData(typeformObject) {
  const { definition, answers } = typeformObject;
  const result = {};

  answers.forEach((answer) => {
    const fieldId = answer.field.id;
    const question = definition.fields.find(field => field.id === fieldId);

    let title = question.title;
    const hasPlaceholderInTitle = question.title.match(/\{\{field:(.*)\}\}/);

    if (hasPlaceholderInTitle) {
      const placeholder = hasPlaceholderInTitle[0];
      const fieldName = hasPlaceholderInTitle[1];
      title = question.title.replace(placeholder, getAnswer(fieldName, answers));
    }

    result[question.ref] = { title };

    switch (question.type) {
      case 'choice':
      case 'multiple_choice':
      case 'dropdown':
        result[question.ref].value = answer.choice.label;
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
      case 'long_text':
        result[question.ref].value = answer.text;
        break;
      case 'date':
        result[question.ref].value = answer.date;
        break;
    }
  });

  return result;
}

function getAnswer(ref, answers) {
  const answer = answers.find((el) => el.field.ref == ref);

  switch (answer.type) {
    case 'choice':
    case 'multiple_choice':
    case 'dropdown':
      return answer.choice.label;
    case 'short_text':
      return answer.text;
    case 'website':
      return answer.url;
    case 'email':
      return answer.email;
    case 'long_text':
      return answer.text;
    case 'date':
      return answer.date;
  }
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
