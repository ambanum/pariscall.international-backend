const COUNTRIES = require('../../data/country-codes');

const CATEGORY_MATCHERS = {
  'civil-society'   : /civil/i,
  'private-sector'  : /priv/i,
  'public-authority': /publi/i,
  'state'           : /([éÉE]tat|State|national gov)/i,
}

function normalizeCategory(answer) {
  return Object.keys(CATEGORY_MATCHERS).find(categoryName => CATEGORY_MATCHERS[categoryName].exec(answer));
}

function normalizeNationality(usualCountryName, lang) {
  const resultingEntry = COUNTRIES.find(entry => entry[`usual-${lang}`] == usualCountryName);

  return resultingEntry && resultingEntry['ISO-3166-1-alpha-3'];
}

module.exports = {
  normalizeCategory,
  normalizeNationality,
}
