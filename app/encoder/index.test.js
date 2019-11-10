const {
  expect
} = require('chai');
const isBase64 = require('is-base64');
const base64url = require('base64url');
const themis = require('jsthemis');

const {
  encode,
  decode,
} = require('./index');

const dataWithAlphabet = {
  formResponse: {
    category: {
      title: 'Quel est le type de votre organisation ?',
      value: 'บาร์เซโลนา'
    },
    name: {
      title: 'Quel est le nom de votre organisation ?',
      value: 'Гуманитарная ассоциация'
    },
    nationality: {
      title: 'Dans quel État votre organisation est-elle établie ?',
      value: '中國'
    },
    website: {
      title: 'Quel est le site web de votre organisation ?',
      value: '日本'
    },
    confirm_email: {
      title: 'Quelle est l’adresse email d’une personne dirigeante de votre organisation auprès de laquelle confirmer la signature ?',
      value: 'an ninh mạng'
    },
    contact_email: {
      title: 'Quelle adresse email pouvons-nous utiliser pour tenir votre organisation informée des nouveautés liées à l’Appel de Paris ?',
      value: 'an_account@example.com'
    }
  },
  date_signed: '2019-10-22T07:49:47.913Z'
};

const data = {
  formResponse: {
    category: {
      title: 'Quel est le type de votre organisation ?',
      value: 'Barcelona'
    },
    name: {
      title: 'Quel est le nom de votre organisation ?',
      value: 'Lorem ipsum dolor'
    },
    nationality: {
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
  date_signed: '2019-10-22T07:49:47.913Z'
}

const longData = {
  formResponse: {
    category: {
      title: 'Quel est le type de votre organisation ?',
      value: 'État, secteur privée, société civile'
    },
    name: {
      title: 'Quel est le nom de votre organisation ?',
      value: 'Non proin eu vestibulum blandit quis consequat magnis sit pretium per velit porttitor lacinia ipsum cursus auctor fermentum imperdiet viverra'
    },
    nationality: {
      title: 'Dans quel État votre organisation est-elle établie ?',
      value: 'Non proin eu vestibulum blandit quis consequat magnis sit pretium per velit porttitor lacinia ipsum cursus auctor fermentum imperdiet viverra'
    },
    website: {
      title: 'Quel est le site web de votre organisation ?',
      value: 'http://non-proin-eu-vestibulum-blandit-quis-consequat-magnis-sit-pretium-per-velit-porttitor-lacinia-ipsum-cursus-auctor-fermentum-imperdiet-viverra.com'
    },
    confirm_email: {
      title: 'Quelle est l’adresse email d’une personne dirigeante de votre organisation auprès de laquelle confirmer la signature ?',
      value: 'non_proin_eu_vestibulum_blandit_quis_consequat_magnis_sit_pretium_per_velit_porttitor_lacinia_ipsum_cursus_auctor_fermentum_imperdiet_viverra@example.com'
    },
    contact_email: {
      title: 'Quelle adresse email pouvons-nous utiliser pour tenir votre organisation informée des nouveautés liées à l’Appel de Paris ?',
      value: 'non_proin_eu_vestibulum_blandit_quis_consequat_magnis_sit_pretium_per_velit_porttitor_lacinia_ipsum_cursus_auctor_fermentum_imperdiet_viverra@example.com'
    }
  },
  date_signed: '2019-10-22T07:49:47.913Z'
}

describe('Encoder actions', () => {
  describe('#encode', () => {
    let encodedData;
    context('with regular data', () => {
      before(() => {
        encodedData = encode(data);
      })
      it('should encode in base64', () => {
        expect(isBase64(base64url.toBase64(encodedData))).to.be.true;
      });
      it('should return an URL safe string', () => {
        expect(encodedData).to.not.includes('/', '+', '=');
      });
    });
    context('with very long data', () => {
      before(() => {
        encodedData = encode(longData);
      })
      it('result should respect the maximum length of an URL (~2000 characters)', () => {
        expect(encodedData.length).to.be.lte(2000);
      })
    });
  });

  describe('#decode', () => {
    let encodedData;
    context('with regular data', () => {
      before(() => { encodedData = encode(data); });

      it('should decode data', () => {
        let decodedData = decode(encodedData);
        expect(decodedData).to.deep.equal(data);
      });

      it('should not decode data using the same algorithm without the master key', () => {
        const seal = new themis.SecureCellSeal(new Buffer.from(' '));
        expect(() => {
          seal.decrypt(base64url.toBuffer(encodedData));
        }).to.throw(Error);
      });
    });

    context('with data from multiples alphabets', () => {
      before(() => { encodedData = encode(dataWithAlphabet); });

      it('should decode data', () => {
        let decodedData = decode(encodedData);
        expect(decodedData).to.deep.equal(dataWithAlphabet);
      });
    });

    context('with non encoded data', () => {
      it('should throw an error', () => {
        expect(() => {
          let decodedData = decode('nonEncodedData');
        }).to.throw(Error);
      });
    });
  });
});
