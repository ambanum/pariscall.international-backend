require('dotenv-safe').config();
const config = require('config');
const {
  expect
} = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const mailer = require('../mailer');
const encoder = require('../encoder');
const repository = require('../repository');

const app = require('../../app');
const enTranslations = require('../../locales/en.json');
const frTranslations = require('../../locales/fr.json');

const invalidToken = 'invalidToken';
const validSupporterData = {
  formResponse: {
    category: {
      title: 'Quel est le type de votre organisation ?',
      value: 'État'
    },
    name: {
      title: 'Quel est le nom de votre organisation ?',
      value: 'Lorem ipsum dolor'
    },
    nationality: {
      title: 'Dans quel État votre organisation est-elle établie ?',
      value: 'France'
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
    const validToken = encoder.encode(validSupporterData);

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

    afterEach(() => mailerStub.resetHistory());

    after(() => {
      mailerStub.restore();
      repositoryStub.restore();
    });

    it('responds 200', function () {
      expect(response.statusCode).to.equal(200);
    });

    it('creates the file on repository', function () {
      expect(repositoryStub.calledOnce).to.be.true;
    });

    it('creates files on the right path', function () {
      const args = repositoryStub.getCall(0).args[0];
      expect(args.path).to.equal(`${config.repository.supporterDestinationFolder}/lorem_ipsum_dolor-state-FRA.md`);
    });

    it('creates the right file content', function () {
      const args = repositoryStub.getCall(0).args[0];
      expect(args.content).to.equal(`---
name: Lorem ipsum dolor
category: state
nature:
nationality: FRA
alliance:
date_signed: '2019-10-22'
---
`);
    });

    context('mail', function () {
      let args;
      const requesterEmail = 'an_account@example.com';

      context('with no lang params', function () {
        before((done) => {
          request(app)
          .get(`/accept/supporter?token=${validToken}`)
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

        it('in the default language', function () {
          expect(args.content).to.includes(enTranslations.mailSignature);
        });
      });

      context('with lang param', function () {
        const lang = "fr";
        before((done) => {
          request(app)
          .get(`/accept/supporter?lang=${lang}&token=${validToken}`)
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

        it('in the specified language', function () {
          expect(args.content).to.includes(frTranslations.mailSignature);
        });
      });
    });
  });
});


const validEventData = {
  formResponse: {
    name: {
      title: "Nom de l'événement",
      value: 'Cyber Pets Gathering'
    },
    start_date: {
      title: 'Date de début',
      value: '2019-11-20'
    },
    type: {
      title: "L'évènement est :",
      value: 'ouvert au public'
    },
    address: {
      title: "Lieu de l'événement",
      value: 'Grande Halle de la Villette, Paris'
    },
    link: {
      title: "Lien vers une description détaillée et l'inscription",
      value: 'https://cyberpets.gathering'
    },
    description: {
      title: "Courte description de l'événement",
      value: 'Why do we always focus on humans? All species are impacted by cybersecurity. This gathering aims at helping them all!'
    },
    hashtag: {
      title: 'Hashtag',
      value: '#CyberPets'
    },
    confirm_email: {
      title: "Courriel pour valider le référencement de l'événement",
      value: 'an_account@example.com'
    }
  },
  date_signed: '2019-10-31T13:48:20.571Z',
  lang: 'en'
};

describe('GET /accept/event', function () {
  context('without token', () => {
    it('responds 403', function (done) {
      request(app)
        .get('/accept/event')
        .expect(403)
        .end(done);
    });
  });

  context('with invalid token', () => {
    it('responds 403', function (done) {
      request(app)
        .get(`/accept/event?token=${invalidToken}`)
        .expect(403)
        .end(done);
    });
  });

  context('with valid token', () => {
    let mailerStub;
    let repositoryStub;
    let response;
    const validToken = encoder.encode(validEventData);

    before((done) => {
      mailerStub = sinon.stub(mailer, 'sendAsAdministrator').resolves('');
      repositoryStub = sinon.stub(repository, 'createFile').resolves('');
      request(app)
        .get(`/accept/event?token=${validToken}`)
        .end((err, res) => {
          response = res;
          done(err);
        });
    });

    afterEach(() => mailerStub.resetHistory());

    after(() => {
      mailerStub.restore();
      repositoryStub.restore();
    });

    it('responds 200', function () {
      expect(response.statusCode).to.equal(200);
    });

    it('creates the file on repository', function () {
      expect(repositoryStub.calledOnce).to.be.true;
    });

    it('creates files on the right path', function () {
      const folder = config.repository.eventDestinationFolder;
      const args = repositoryStub.getCall(0).args[0];
      expect(args.path).to.equal(`${folder}/cyber_pets_gathering.md`);
    });

    it('creates the right files content', function () {
      const args = repositoryStub.getCall(0).args[0];
      expect(args.content).to.equal(`---
name: Cyber Pets Gathering
address: Grande Halle de la Villette, Paris
city:
country:
link: https://cyberpets.gathering
link_title: https://cyberpets.gathering
start_date: '2019-11-20'
end_date: '2019-11-20'
time:
---
Why do we always focus on humans? All species are impacted by cybersecurity. This gathering aims at helping them all!
`);
    });

    context('mail', function () {
      let args;
      const requesterEmail = 'an_account@example.com';

      context('with no lang params', function () {
        before((done) => {
          request(app)
          .get(`/accept/event?token=${validToken}`)
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

        it('in the default language', function () {
          expect(args.content).to.includes(enTranslations.mailSignature);
        });
      });

      context('with lang param', function () {
        const lang = "fr";
        before((done) => {
          request(app)
          .get(`/accept/event?lang=${lang}&token=${validToken}`)
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

        it('in the specified language', function () {
          expect(args.content).to.includes(frTranslations.mailSignature);
        });
      });
    });
  });
});
