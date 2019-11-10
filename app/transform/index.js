const CATEGORY_MATCHERS = {
  'civil-society'   : /civil/i,
  'private-sector'  : /priv/i,
  'public-authority': /publi/i,
  'state'           : /([éÉE]tat|State|national gov)/i,
}

function normalizeCategory(answer) {
  return Object.keys(CATEGORY_MATCHERS).find(categoryName => CATEGORY_MATCHERS[categoryName].exec(answer));
}

module.exports = {
  normalizeCategory,
}
