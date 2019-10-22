require('dotenv').config();
const {
  expect
} = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mailer = require('../mailer');
const encoder = require('../encoder');
const github = require('../github');

const app = require('../../app');

const invalidToken = 'invalidToken';
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


describe('GET /accept', function () {
  context('without token', () => {
    it('responds 403', function (done) {
      request(app)
        .get('/accept')
        .expect(403)
        .end(done);
    });
  });

  context('with invalid token', () => {
    it('responds 403', function (done) {
      request(app)
        .get(`/accept?token=${invalidToken}`)
        .expect(403)
        .end(done);
    });
  });

  context('with valid token', () => {
    let mailerStub;
    let githubStub;
    let response;
    const validToken = encoder.encode(validData);

    before((done) => {
      mailerStub = sinon.stub(mailer, 'send').resolves('');
      githubStub = sinon.stub(github, 'createFile').resolves('');
      request(app)
        .get(`/accept?token=${validToken}`)
        .end((err, res) => {
          response = res;
          done(err);
        });
    });

    after(() => {
      mailerStub.restore();
      githubStub.restore();
    });

    it('responds 200', function () {
      expect(response.statusCode).to.equal(200);
    });

    it('creates the file on github', function () {
      expect(githubStub.calledOnce).to.be.true;
    });

    it('creates the file on the right github repository', function () {
      const arguments = githubStub.getCall(0).args[0];
      expect(arguments.owner).to.equal(process.env.REPO_OWNER);
      expect(arguments.repo).to.equal(process.env.REPO_NAME);
    });

    it('creates the file on the right path', function () {
      const arguments = githubStub.getCall(0).args[0];
      expect(arguments.path).to.equal(`${process.env.REPO_DEST_FOLDER}/lorem_ipsum_dolor.md`);
    });

    it('creates the right file content', function () {
      const arguments = githubStub.getCall(0).args[0];
      expect(arguments.content).to.equal(`---
name: Lorem ipsum dolor
category: Barcelona
nature:
nationality: Lorem ipsum dolor
alliance:
date_signed: 2019-10-22
---
`);
    });

    it('sends confirmation email to requester', function () {
      expect(mailerStub.calledOnce).to.be.true;
      const arguments = mailerStub.getCall(0).args[0];
      expect(arguments.to.email).to.equal('an_account@example.com');
    });
  });
});
