# Paris Call contribution API

An API transforming Typeform data from incoming webhooks into confirmation emails sent to the filler of the form, then into approval emails sent to a third party, and finally into a Jekyll-compatible file in some repository.

> Serveur permettant de confirmer les adresses email et d'ajouter des organisations dans la liste des soutiens de l'Appel de Paris.

- - -

## Development

### Prerequisites

- [Node](https://nodejs.org/en/download)
- [Themis Core](https://docs.cossacklabs.com/pages/documentation-themis/#installing-themis-core)

### Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/ambanum/paris-call-server.git
cd paris-call-server
npm install
```

Create a `.env` file based on the provided `.env.example` file, adjusting each variable as appropriate.

Create a `config/development.js` file based on the provided `config/development.js.example` file, adjusting each variable as appropriate.

### Usage

Start the server:

```sh
npm start
```

## Deployment

Clone the repository on your server, install dependencies and run the webserver.
We suggest to use a production process manager for Node.js like [pm2](https://github.com/Unitech/pm2) or [Forever](https://github.com/foreversd/forever#readme).

- - -

## How to add a language

1. In the `config/default.js` add the new language identifier in the array `supportedLanguages`:

```
module.exports = {
  supportedLanguages: ['en', 'fr', '<LANGUAGE_IDENTIFIER>'],
  repository: {
  …
```

2. Create a JSON translations file for the new language in the folder `locales`, copy the content of the `locales/en.json` file and translates the content.

3. In the file `app/transform/index.js` ensure the RegExps for _categories_ (in the variable `CATEGORY_MATCHERS`) and _openness levels_ (in the variable `OPENNESS_LEVEL_MATCHERS`) properly matches the possible text contents of the corresponding questions in TypeForm.

See [ambanum/pariscall.international](https://github.com/ambanum/pariscall.international) readme for adding new language support also on the frontend side.

- - -

# License

EUPL v1.2: akin to an AGPL, but more readable and translated and legally binding into all languages of the EU. [Recap](https://choosealicense.com/licenses/eupl-1.2/).
