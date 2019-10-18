const base64url = require('base64url')
const {
  getKeyFromPassword,
  getSalt,
  encrypt,
  decrypt,
  } = require('../encrypt/actions');

let key = getKeyFromPassword(Buffer.from('mysecretpassword'), getSalt());

function encode(data) {
  const dataStringified = JSON.stringify(data);
  let ciphertext = encrypt(dataStringified, key);
  const safeBase64url = base64url(ciphertext);
  return safeBase64url;
}

function decode(safeBase64url) {
  const string = base64url.toBuffer(safeBase64url);
  const decrypted = decrypt(string, key);
  const resultObject = JSON.parse(decrypted);
  return resultObject;
}

module.exports = {
  encode,
  decode
};
