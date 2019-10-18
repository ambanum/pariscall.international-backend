const assert = require('assert');
const {
  expect
} = require('chai');
const {
encode,
decode,
} = require('./actions');

describe('Encoder actions', () => {
  describe('encode()', function() {
    it('should return the same message text after decryption of text encrypted with a randomly generated key', function() {
      let data = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      };

      let encodedData = encode(data);
      let decodedData = decode(encodedData);
      expect(decodedData).to.deep.equal(data);
    });
  });
});
