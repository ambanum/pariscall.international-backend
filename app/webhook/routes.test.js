const {
  expect
} = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mailer = require('../mailer');
const encoder = require('../encoder');

const app = require('../../app');
const {
  typeformRequest,
  requesterEmail,
} = require('./fixtures');

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

    it('sends a mail to the requester with encoded data', function (done) {
      request(app)
        .post('/webhook/supporter')
        .send(typeformRequest.payload)
        .set('Content-Type', typeformRequest.headers['Content-Type'])
        .set('Typeform-Signature', typeformRequest.headers['Typeform-Signature'])
        .expect(200)
        .end(function (err) {
          expect(mailerStub.calledOnce).to.be.true;
          const arguments = mailerStub.getCall(0).args[0];
          expect(arguments.to.email).to.equal(requesterEmail);
          expect(arguments.content).to.includes(encodedDataResult);
          done(err);
        });
    });
  });
});
