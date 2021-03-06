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
      value: 'Lorem ipsum " dolor'
    },
    nationality: {
      title: 'Dans quel État votre organisation est-elle établie ?',
      value: 'France'
    },
    website: {
      title: 'Quel est le site web de votre organisation ?',
      value: 'http://example-url.com?userId=20&test'
    },
    linkedin: {
      title: 'La page LinkedIn de votre organisation',
      value: 'http://linkedin.com/kjh123?userId=20&test'
    },
    twitter: {
      title: 'Le compte Twitter de votre organisation',
      value: '@cybersec'
    },
    confirm_email: {
      title: 'Quelle est l’adresse email d’une personne dirigeante de votre organisation auprès de laquelle confirmer la signature ?',
      value: 'an_account@example.com'
    },
    contact_email: {
      title: 'Quelle adresse email pouvons-nous utiliser pour tenir votre organisation informée des nouveautés liées à l’Appel de Paris ?',
      value: 'an_account@example.com'
    },
    introduction: {
      title: "En un tweet (280 caractères), pourquoi avez-vous décidé de soutenir l'Appel de Paris ?",
      value: 'Dictumst fusce etiam natoque primis maecenas conubia sit interdum dignissim velit, consectetur malesuada torquent integer non accumsan augue porta vehicula, ipsum id lectus a volutpat feugiat aliquam habitant bibendum massa, proin mattis sem tortor diam lacinia pretium platea.'
    }
  },
  lang: 'fr',
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
name: "Lorem ipsum \\" dolor"
category: state
nature:
nationality: FRA
website: "http://example-url.com?userId=20&test"
twitter: "@cybersec"
linkedin: "http://linkedin.com/kjh123?userId=20&test"
date_signed: 2019-10-22
---
Dictumst fusce etiam natoque primis maecenas conubia sit interdum dignissim velit, consectetur malesuada torquent integer non accumsan augue porta vehicula, ipsum id lectus a volutpat feugiat aliquam habitant bibendum massa, proin mattis sem tortor diam lacinia pretium platea.
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
      value: 'Cybersecurity, Human Rights, and the Prospects for Cyber Peace - A Joint Research & Policy Workshop'
    },
    start_date: {
      title: 'Date de début',
      value: '2019-11-20'
    },
    openness_level: {
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
      expect(args.path).to.equal(`${folder}/cybersecurity_human_rights_and_the_prospects_for_cyber_peace_a_joint_r-2019-11-20-52af4cc.md`);
    });

    it('creates the right files content', function () {
      const args = repositoryStub.getCall(0).args[0];
      expect(args.content).to.equal(`---
name: "Cybersecurity, Human Rights, and the Prospects for Cyber Peace - A Joint Research & Policy Workshop"
address: "Grande Halle de la Villette, Paris"
link: "https://cyberpets.gathering"
link_title: "https://cyberpets.gathering"
start_date: 2019-11-20
end_date: 2019-11-20
hashtag: "#CyberPets"
openness_level: public
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
