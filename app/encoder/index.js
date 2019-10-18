require('dotenv').config();
const base64url = require('base64url');
const themis = require('jsthemis');
const zlib = require('zlib');

const seal = new themis.SecureCellSeal(new Buffer.from(process.env.ENCODER_KEY));

function encode(data) {
  const dataStringified = JSON.stringify(data);
  // Compress data with gzip
  const gzip = zlib.gzipSync(dataStringified);

  // Encrypt zipped data
  let ciphertext = seal.encrypt(new Buffer.from(gzip));

  // Convert result in base64 safe for URL
  const safeBase64url = base64url(ciphertext);

  return safeBase64url;
}

function decode(safeBase64url) {
  const string = base64url.toBuffer(safeBase64url);
  const decrypted = seal.decrypt(string);
  const buffer = zlib.gunzipSync(decrypted);
  const resultObject = JSON.parse(buffer);
  return resultObject;
}

module.exports = {
  encode,
  decode
};
