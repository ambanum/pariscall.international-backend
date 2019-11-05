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

### Usage

Start the server:

```sh
npm start
```

## Deployment

Clone the repository on your server, install dependencies and run the webserver.
We suggest to use a production process manager for Node.js like [pm2](https://github.com/Unitech/pm2) or [Forever](https://github.com/foreversd/forever#readme).

- - -

# License

EUPL v1.2: akin to an AGPL, but more readable and translated and legally binding into all languages of the EU. [Recap](https://choosealicense.com/licenses/eupl-1.2/).
