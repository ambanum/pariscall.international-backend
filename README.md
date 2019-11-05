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

Create `.env` file with:

- `ENCODER_KEY`: Master Kkey for encrypting data
- `MAILJET_APIKEY_PUBLIC`: Mailjet mailer public api key
- `MAILJET_APIKEY_PRIVATE`: Mailjet mailer private api key
- `GITHUB_USER_KEY`: Github [personal access token](https://github.com/settings/tokens) that can be used to access the GitHub API.
- `REPO_OWNER`: Owner of the repository to commit files
- `REPO_NAME`: Repository name
- `REPO_SUPPORTER_DEST_FOLDER`: Folder in repository to create supporters files in
- `REPO_EVENT_DEST_FOLDER`: Folder in repository to create events files in
- `PARIS_CALL_WEBSITE`: URL to redirect user after email is confirmed
- `PARIS_CALL_API_URL`: URL of this server
- `TYPEFORM_KEY`: Typeform secret to securize webhook
- `SENDER_NAME`: Sender name used to send email to supporters
- `SENDER_EMAIL`: Sender email used to send email to supporters
- `BOT_EMAIL`: Bot email used to send email to approvers
- `BOT_NAME`: Bot name used to send email to approvers
- `APPROVER_EMAIL`: Approbator email

Example:
```
ENCODER_KEY='password'
MAILJET_APIKEY_PUBLIC='d3522c8267bb0f41e84b35e51e7981618008a485'
MAILJET_APIKEY_PRIVATE='636a6756861f8d411427ebf84d405445ad0d5f97'
GITHUB_USER_KEY='51945cf157f754d1f5cef76760936658f6875887'
REPO_OWNER='Ndpnt'
REPO_NAME='test'
REPO_DEST_FOLDER='_supporters'
PARIS_CALL_WEBSITE='https://pariscall.diplomatie.fr'
PARIS_CALL_API_URL='https://pariscall.diplomatie.fr/api'
TYPEFORM_KEY='a937079360f28a8bab3a8fd9708ac3cde6f9f3f1'
SENDER_NAME='Paris Call'
SENDER_EMAIL='an_account@example.com'
BOT_EMAIL='an_account@example.com'
BOT_NAME='Bot'
APPROVER_EMAIL='an_account@example.com'
```

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
