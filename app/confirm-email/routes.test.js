require('dotenv').config();
const config = require('config');
const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mailer = require('../mailer');
const encoder = require('../encoder');

const app = require('../../app');

const invalidToken = 'invalidToken';
const expiredToken = 'AAEBQAwAAAAQAAAAiQEAANTn8s0moVETOyvYSMF6ZZ1arzWzMKSOaYjfR2dQ4xspzstYFbmPbOxi54eYOo5v6WaCDOkaYcejNjvGRZgKh8hcQlkQJFiNHeDREhjW1fYZlXu-rozkjhh2TS5yS23fwX6X5T3S_ezDvuLs9yE_wfajXpmp21BH3C6ycx_3zWUrinK8Ty0pa1yWEn7a08HNOlHZ2WvIeZujc4SX_jw4iMgDLPGuhNdH5kqQXPj86ZkgEA8YMF7mgEOy6ggbPNylbzZz_wYw8mgnUNsrRinJy9lk1TO-_3GxFCkFB8Buetld1wN7Bgr-MBrFrIkgXkLOVEhTLNi_vEOLj7OPcQr8WT67ne7-aRtpKrEacLGh1geUvWmtVmvluPijEAiotKgBb8pdMu1KouDCBkpT-X1xvszkTu3e4W8kcSF1m6DCFT97AmAGopK0wn43_feEvcgi9hQws5Td_T8mrq9-8-YwFsFXVXFqUh2OynzHbb9CvU4MrV9Cp4hqJZ5plMJXg463rBvsGTM13It910-5V3UNnNsmZsYPFy444GCO7IFRR4iKfvosmA4';
const validData = {
  formResponse: {
    category: {
      title: 'Quel est le type de votre organisation ?',
      value: 'Barcelona'
    },
    name: {
      title: 'Quel est le nom de votre organisation ?',
      value: 'Lorem ipsum dolor'
    },
    state: {
      title: 'Dans quel État votre organisation est-elle établie ?',
      value: 'Lorem ipsum dolor'
    },
    website: {
      title: 'Quel est le site web de votre organisation ?',
      value: 'http://example-url.com'
    },
    confirm_email: {
      title: 'Quelle est l’adresse email d’une personne dirigeante de votre organisation auprès de laquelle confirmer la signature ?',
      value: 'an_account@example.com'
    },
    contact_email: {
      title: 'Quelle adresse email pouvons-nous utiliser pour tenir votre organisation informée des nouveautés liées à l’Appel de Paris ?',
      value: 'an_account@example.com'
    }
  },
  date_signed: new Date().toISOString()
};

describe('GET /confirm-email/supporter', function () {
  context('without token', () => {
    it('responds 403', function (done) {
      request(app)
        .get('/confirm-email/supporter')
        .expect(403)
        .end(done);
    });
  });

  context('with invalid token', () => {
    it('responds 302 and redirect to confirm error page', function (done) {
      request(app)
        .get(`/confirm-email/supporter?token=${invalidToken}`)
        .expect(302)
        .end((err, res) => {
          expect(res.header.location).to.equal(`${config.frontend.website}/en/confirm/error`);
          done(err);
        });
    });
  });

  context('with valid expired token', () => {
    it('responds 302 and redirect to expired error page', function (done) {
      request(app)
        .get(`/confirm-email/supporter?token=${expiredToken}`)
        .expect(302)
        .end((err, res) => {
          expect(res.header.location).to.equal(`${config.frontend.website}/en/confirm/expired`);
          done(err);
        });
    });
  });

  context('with valid token', () => {
    let mailerStub;
    let response;
    const validToken = encoder.encode(validData);

    before((done) => {
      mailerStub = sinon.stub(mailer, 'sendAsBot').resolves('');
      request(app)
        .get(`/confirm-email/supporter?token=${validToken}`)
        .end((err, res) => {
          response = res;
          done(err);
        });
    });

    after(() => mailerStub.restore());

    it('responds 302', function () {
      expect(response.statusCode).to.equal(302);
    });

    it('redirects to confirm success page', function () {
      expect(response.header.location).to.equal(`${config.frontend.website}/en/confirm`);
    });

    it('sends an email to APPROBATOR_EMAIL', function () {
      expect(mailerStub.calledOnce).to.be.true;
      const arguments = mailerStub.getCall(0).args[0];
      expect(arguments.to.email).to.equal(config.mailer.approbator.email);
    });
  });
});
