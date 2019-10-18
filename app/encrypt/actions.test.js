const assert = require('assert');
const {
  expect
} = require('chai');
const {
getRandomKey,
getKeyFromPassword,
getSalt,
encrypt,
decrypt,
} = require('./actions');

describe('Encoder actions', () => {
  describe('decrypt()', function() {
    it('should return the same message text after decryption of text encrypted with a randomly generated key', function() {
      let plaintext = 'my message text';
      let key = getRandomKey();
      let ciphertext = encrypt(plaintext, key);

      let decryptOutput = decrypt(ciphertext, key);

      assert.equal(decryptOutput.toString('utf8'), plaintext);
    });

    it('should return the same message text after decryption of text excrypted with a key generated from a password', function() {
      let plaintext = 'my message text';
      /**
       * Ideally the password would be read from a file and will be in a Buffer
       */
      let key = getKeyFromPassword(Buffer.from('mysecretpassword'), getSalt());
      let ciphertext = encrypt(plaintext, key);

      let decryptOutput = decrypt(ciphertext, key);

      assert.equal(decryptOutput.toString('utf8'), plaintext);
    });
  });
});
