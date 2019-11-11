const COUNTRIES = require('../../data/country-codes');

const CATEGORY_MATCHERS = {
  'civil-society'   : /civil/i,
  'private-sector'  : /priv/i,
  'public-authority': /publi/i,
  'state'           : /([éÉE]tat|State|national gov)/i,
}

const OPENNESS_LEVELS = {
  BY_INVITATION_ONLY: 'by-invitation-only',
  PUBLIC: 'public',
}
const OPENNESS_LEVEL_MATCHERS = {
  [OPENNESS_LEVELS.BY_INVITATION_ONLY]: /invitation/i,
  [OPENNESS_LEVELS.PUBLIC]            : /public/i,
}

function normalizeCategory(answer) {
  return Object.keys(CATEGORY_MATCHERS).find(categoryName => CATEGORY_MATCHERS[categoryName].exec(answer));
}

function normalizeNationality(usualCountryName, lang) {
  const resultingEntry = COUNTRIES.find(entry => entry[`usual-${lang}`] == usualCountryName);

  return resultingEntry && resultingEntry['ISO-3166-1-alpha-3'];
}

function normalizeOpennessLevel(answer) {
  const result = Object.keys(OPENNESS_LEVEL_MATCHERS).find(levelName => OPENNESS_LEVEL_MATCHERS[levelName].exec(answer));

  return result || OPENNESS_LEVELS.PUBLIC;
}

module.exports = {
  normalizeCategory,
  normalizeNationality,
  normalizeOpennessLevel,
}
