const { expect } = require('chai');

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
});
