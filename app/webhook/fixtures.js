const organizationName = 'Rosemann Junk e.V.';
const requesterEmail = 'dehmelhans-josef@zahn.org';
const typeformRequest = {
  headers: {
    'Typeform-Signature': 'sha256=K4ImEDhJ/pY3wlLkvwgBz8zt2px4q5UihvtsdOaia7Q=',
    'Content-Type': 'application/json'
  },
  payload: {
    "event_id": "01DQSA0X2EVWSV35KY0CQD7ZNZ",
    "event_type": "form_response",
    "form_response": {
      "form_id": "Y5eTGr",
      "token": "01DQSA0X2EVWSV35KY0CQD7ZNZ",
      "landed_at": "2019-10-22T08:41:05Z",
      "submitted_at": "2019-10-22T08:41:05Z",
      "definition": {
        "id": "Y5eTGr",
        "title": "Soutenir l’Appel de Paris",
        "fields": [
          {
            "id": "lI31dsCcjFqn",
            "title": "Quel est le type de votre organisation ?",
            "type": "multiple_choice",
            "ref": "category",
            "properties": {},
            "choices": [
              {
                "id": "F077FtYARF4X",
                "label": "État"
              },
              {
                "id": "Gh59rifFtZQI",
                "label": "Secteur privé"
              },
              {
                "id": "HeK6wXyWJNqs",
                "label": "Société civile"
              }
            ]
          },
          {
            "id": "LBZ9qoBPVy0r",
            "title": "Quel est le nom de votre organisation ?",
            "type": "short_text",
            "ref": "name",
            "properties": {}
          },
          {
            "id": "R0GFkhGlktel",
            "title": "Dans quel État votre organisation est-elle établie ?",
            "type": "short_text",
            "ref": "state",
            "properties": {}
          },
          {
            "id": "McUROoDEGvko",
            "title": "Quel est le site web de votre organisation ?",
            "type": "website",
            "ref": "website",
            "properties": {}
          },
          {
            "id": "BBStGYjV9QLl",
            "title": "Quelle est l’adresse email d’une personne dirigeante de votre organisation auprès de laquelle confirmer la signature ?",
            "type": "email",
            "ref": "confirm_email",
            "properties": {}
          },
          {
            "id": "msNOk5KXWXB2",
            "title": "Quelle adresse email pouvons-nous utiliser pour tenir votre organisation informée des nouveautés liées à l’Appel de Paris ?",
            "type": "email",
            "ref": "contact_email",
            "properties": {}
          }
        ]
      },
      "answers": [
        {
          "type": "choice",
          "choice": {
            "label": "Barcelona"
          },
          "field": {
            "id": "lI31dsCcjFqn",
            "type": "multiple_choice",
            "ref": "category"
          }
        },
        {
          "type": "text",
          "text": organizationName,
          "field": {
            "id": "LBZ9qoBPVy0r",
            "type": "short_text",
            "ref": "name"
          }
        },
        {
          "type": "text",
          "text": "Lorem ipsum dolor",
          "field": {
            "id": "R0GFkhGlktel",
            "type": "short_text",
            "ref": "state"
          }
        },
        {
          "type": "url",
          "url": "http://example-url.com",
          "field": {
            "id": "McUROoDEGvko",
            "type": "website",
            "ref": "website"
          }
        },
        {
          "type": "email",
          "email": requesterEmail,
          "field": {
            "id": "BBStGYjV9QLl",
            "type": "email",
            "ref": "confirm_email"
          }
        },
        {
          "type": "email",
          "email": "an_account@example.com",
          "field": {
            "id": "msNOk5KXWXB2",
            "type": "email",
            "ref": "contact_email"
          }
        }
      ]
    }
  }
}

module.exports = {
  typeformRequest,
  organizationName,
  requesterEmail,
};
