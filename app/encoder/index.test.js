const {
  expect
} = require('chai');
const {
encode,
decode,
} = require('./index');

let data = {
  key1: 'value1',
  key2: 'value2',
  key3: 'value3',
};

describe('Encoder actions', () => {
  describe('#encode', () => {
    it('should encode data', () => {
      let encodedData = encode(data);
      expect(encodedData).to.be.not.deep.equal(data);
      expect(encodedData).to.be.a.string;
      expect(encodedData).to.not.contain(' ');
    });
  });
  describe('#decode', () => {
    let encodedData;

    before(() => {
      encodedData = encode(data);
    });

    it('should decode data', () => {
      let decodedData = decode(encodedData);
      expect(decodedData).to.deep.equal(data);
    });
  });
});
