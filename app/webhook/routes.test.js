const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mailer = require('../mailer');
const encoder = require('../encoder');

const app = require('../../app');
const { typeformRequest, requesterEmail } = require('./fixtures');
const enTranslations = require('../../locales/en.json');
const frTranslations = require('../../locales/fr.json');
const defaultLanguage = 'en';

describe('POST /webhook/supporter', function () {
  context('without Typeform signature', () => {
    it('responds 403', function (done) {
      request(app)
        .post('/webhook/supporter')
        .send(typeformRequest.payload)
        .set('Content-Type', typeformRequest.headers['Content-Type'])
        .expect(403)
        .end(done);
    });
  });

  context('with invalid Typeform signature', () => {
    it('responds 403', function (done) {
      const invalidTypeformSignature = 'sha256=uUy7/8steB7ZgPXs4DtWMT1auaLsP1yRpLUHkPW1bZQ=';
      request(app)
        .post('/webhook/supporter')
        .send(typeformRequest.payload)
        .set('Content-Type', typeformRequest.headers['Content-Type'])
        .set('Typeform-Signature', invalidTypeformSignature)
        .expect(403)
        .end(done);
    });
  });

  context('with valid Typeform signature', () => {
    let mailerStub;
    let encoderStub;
    const encodedDataResult = 'encodedDataString';

    before(() => {
      mailerStub = sinon.stub(mailer, 'sendAsAdministrator').resolves('');
      encoderStub = sinon.stub(encoder, 'encode').returns(encodedDataResult);
    });

    afterEach(() => mailerStub.resetHistory());

    after(() => {
      mailerStub.restore();
      encoderStub.restore();
    });

    it('responds with 200', function (done) {
      request(app)
        .post('/webhook/supporter')
        .send(typeformRequest.payload)
        .set('Content-Type', typeformRequest.headers['Content-Type'])
        .set('Typeform-Signature', typeformRequest.headers['Typeform-Signature'])
        .expect(200)
        .end(done);
    });

    context('mail', function () {
      let args;

      context('with no lang params', function () {
        before((done) => {
          request(app)
          .post('/webhook/supporter')
          .send(typeformRequest.payload)
          .set('Content-Type', typeformRequest.headers['Content-Type'])
          .set('Typeform-Signature', typeformRequest.headers['Typeform-Signature'])
          .expect(200)
          .end(function (err) {
            args = mailerStub.getCall(0).args[0];
            done(err);
          });
        });

        it('sends a mail', function () {
          expect(mailerStub.calledOnce).to.be.true;
        });

        it('to the requester', function () {
          expect(args.to.email).to.equal(requesterEmail);
        });

        it('with the proper link', function () {
          expect(args.content).to.includes(`/confirm-email/supporter?lang=${defaultLanguage}&amp;token=${encodedDataResult}`);
        });

        it('in the specified language', function () {
          expect(args.content).to.includes(enTranslations.mailSignature);
        });
      });

      context('with lang param', function () {
        const lang = "fr";
        before((done) => {
          request(app)
          .post(`/webhook/supporter?lang=${lang}`)
          .send(typeformRequest.payload)
          .set('Content-Type', typeformRequest.headers['Content-Type'])
          .set('Typeform-Signature', typeformRequest.headers['Typeform-Signature'])
          .expect(200)
          .end(function (err) {
            args = mailerStub.getCall(0).args[0];
            done(err);
          });
        });

        it('sends a mail', function () {
          expect(mailerStub.calledOnce).to.be.true;
        });

        it('to the requester', function () {
          expect(args.to.email).to.equal(requesterEmail);
        });

        it('with the proper link', function () {
          expect(args.content).to.includes(`/confirm-email/supporter?lang=${lang}&amp;token=${encodedDataResult}`);
        });

        it('in the specified language', function () {
          expect(args.content).to.includes(frTranslations.mailSignature);
        });
      });
    });
  });
});

describe('POST /webhook/event', function () {
  context('without Typeform signature', () => {
    it('responds 403', function (done) {
      request(app)
        .post('/webhook/event')
        .send(typeformRequest.payload)
        .set('Content-Type', typeformRequest.headers['Content-Type'])
        .expect(403)
        .end(done);
    });
  });

  context('with invalid Typeform signature', () => {
    it('responds 403', function (done) {
      const invalidTypeformSignature = 'sha256=uUy7/8steB7ZgPXs4DtWMT1auaLsP1yRpLUHkPW1bZQ=';
      request(app)
        .post('/webhook/event')
        .send(typeformRequest.payload)
        .set('Content-Type', typeformRequest.headers['Content-Type'])
        .set('Typeform-Signature', invalidTypeformSignature)
        .expect(403)
        .end(done);
    });
  });

  context('with valid Typeform signature', () => {
    let mailerStub;
    let encoderStub;
    const encodedDataResult = 'encodedDataString';

    before(() => {
      mailerStub = sinon.stub(mailer, 'sendAsAdministrator').resolves('');
      encoderStub = sinon.stub(encoder, 'encode').returns(encodedDataResult);
    });

    afterEach(() => mailerStub.resetHistory());

    after(() => {
      mailerStub.restore();
      encoderStub.restore();
    });

    it('responds with 200', function (done) {
      request(app)
        .post('/webhook/event')
        .send(typeformRequest.payload)
        .set('Content-Type', typeformRequest.headers['Content-Type'])
        .set('Typeform-Signature', typeformRequest.headers['Typeform-Signature'])
        .expect(200)
        .end(done);
    });

    context('mail', function () {
      let args;

      context('with no lang params', function () {
        before((done) => {
          request(app)
          .post('/webhook/event')
          .send(typeformRequest.payload)
          .set('Content-Type', typeformRequest.headers['Content-Type'])
          .set('Typeform-Signature', typeformRequest.headers['Typeform-Signature'])
          .expect(200)
          .end(function (err) {
            args = mailerStub.getCall(0).args[0];
            done(err);
          });
        });

        it('sends a mail', function () {
          expect(mailerStub.calledOnce).to.be.true;
        });

        it('to the requester', function () {
          expect(args.to.email).to.equal(requesterEmail);
        });

        it('with the proper link', function () {
          expect(args.content).to.includes(`/confirm-email/event?lang=${defaultLanguage}&amp;token=${encodedDataResult}`);
        });

        it('in the specified language', function () {
          expect(args.content).to.includes(enTranslations.mailSignature);
        });
      });

      context('with lang param', function () {
        const lang = "fr";
        before((done) => {
          request(app)
          .post(`/webhook/event?lang=${lang}`)
          .send(typeformRequest.payload)
          .set('Content-Type', typeformRequest.headers['Content-Type'])
          .set('Typeform-Signature', typeformRequest.headers['Typeform-Signature'])
          .expect(200)
          .end(function (err) {
            args = mailerStub.getCall(0).args[0];
            done(err);
          });
        });

        it('sends a mail', function () {
          expect(mailerStub.calledOnce).to.be.true;
        });

        it('to the requester', function () {
          expect(args.to.email).to.equal(requesterEmail);
        });

        it('with the proper link', function () {
          expect(args.content).to.includes(`/confirm-email/event?lang=${lang}&amp;token=${encodedDataResult}`);
        });

        it('in the specified language', function () {
          expect(args.content).to.includes(frTranslations.mailSignature);
        });
      });
    });
  });
});

