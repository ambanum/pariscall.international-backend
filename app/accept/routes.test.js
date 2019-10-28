require('dotenv').config();
const config = require('config');
const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mailer = require('../mailer');
const encoder = require('../encoder');
const repository = require('../repository');

const app = require('../../app');

const invalidToken = 'invalidToken';
const validData = {
  formResponse: {
    category: {
      title: 'Quel est le type de votre organisation ?',
      value: 'État-nation'
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
  date_signed: '2019-10-22T08:04:35.611Z'
};


describe('GET /accept/supporter', function () {
  context('without token', () => {
    it('responds 403', function (done) {
      request(app)
        .get('/accept/supporter')
        .expect(403)
        .end(done);
    });
  });

  context('with invalid token', () => {
    it('responds 403', function (done) {
      request(app)
        .get(`/accept/supporter?token=${invalidToken}`)
        .expect(403)
        .end(done);
    });
  });

  context('with valid token', () => {
    let mailerStub;
    let repositoryStub;
    let response;
    const validToken = encoder.encode(validData);

    before((done) => {
      mailerStub = sinon.stub(mailer, 'sendAsAdministrator').resolves('');
      repositoryStub = sinon.stub(repository, 'createFile').resolves('');
      request(app)
        .get(`/accept/supporter?token=${validToken}`)
        .end((err, res) => {
          response = res;
          done(err);
        });
    });

    after(() => {
      mailerStub.restore();
      repositoryStub.restore();
    });

    it('responds 200', function () {
      expect(response.statusCode).to.equal(200);
    });

    it('creates the file on repository', function () {
      expect(repositoryStub.calledTwice).to.be.true;
    });

    it('creates files on the right path', function () {
      config.repository.supporterDestinationFolders.forEach((folder, index) => {
        const args = repositoryStub.getCall(index).args[0];
        expect(args.path).to.equal(`${folder}/lorem_ipsum_dolor-state-lorem_ipsum_dolor.md`);
      });
    });

    it('creates the right files content', function () {
      config.repository.supporterDestinationFolders.forEach((_, index) => {
        const args = repositoryStub.getCall(index).args[0];
        expect(args.content).to.equal(`---
name: Lorem ipsum dolor
category: state
nature:
nationality: Lorem ipsum dolor
alliance:
date_signed: '2019-10-22'
---
`);
      });
    });

    it('sends confirmation email to requester', function () {
      expect(mailerStub.calledOnce).to.be.true;
      const arguments = mailerStub.getCall(0).args[0];
      expect(arguments.to.email).to.equal('an_account@example.com');
    });
  });
});
