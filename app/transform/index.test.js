const { expect } = require('chai');

const config = require('config');
const transform = require('./index');


describe('Transformation of form data', () => {
  describe('#normalizeCategory', () => {
    const ANSWERS_TO_CATEGORIES = {
      'A national government': 'state',
      'A local government or public agency': 'public-authority',
      'A company or other private organization': 'private-sector',
      'A civil society organization': 'civil-society',
      'Un État': 'state',
      'Un organisme public ou administration territoriale': 'public-authority',
      'Une organisation de la société civile': 'civil-society',
      'Une entreprise ou autre acteur privé': 'private-sector',
    };

    Object.keys(ANSWERS_TO_CATEGORIES).forEach(answer => {
      it(`gives the proper category for "${answer}"`, () => {
        expect(transform.normalizeCategory(answer)).to.equal(ANSWERS_TO_CATEGORIES[answer]);
      });
    });
  });

  describe('#normalizeNationality', () => {
    const COUNTRIES_TO_CODES = {
      fr: {
        'France': 'FRA',
        'Congo': 'COG',
        'République démocratique du Congo': 'COD',
        'Saint-Siège': 'VAT',
        'Territoires palestiniens': '',
        'This country does not exist': void 0,
      },
      en: {
        'France': 'FRA',
        'Congo': 'COG',
        'Vatican': 'VAT',
        'This country does not exist': void 0,
      }
    };

    config.supportedLanguages.forEach(lang => {
      context(`For lang ${lang}`, () => {
        Object.keys(COUNTRIES_TO_CODES[lang]).forEach(country => {
          it(`gives the proper ISO code for "${country}"`, () => {
            expect(transform.normalizeNationality(country, lang)).to.equal(COUNTRIES_TO_CODES[lang][country]);
          });
        });
      });
    });
  });
});
