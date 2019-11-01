const express = require('express');
const i18n = require('i18n');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');

const webhookRouter = require('./app/webhook/routes');
const confirmEmailRouter = require('./app/confirm-email/routes');
const acceptRouter = require('./app/accept/routes');

const app = express();

i18n.configure({
  objectNotation: true,
  locales:['en', 'fr'],
  defaultLocale: 'en',
  directory: __dirname + '/locales',
  queryParameter: 'lang'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
if(app.get('env') !== 'test') {
  app.use(logger('dev'));
}
app.use(i18n.init);
app.use(bodyParser.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/webhook', webhookRouter);
app.use('/confirm-email', confirmEmailRouter);
app.use('/accept', acceptRouter);

module.exports = app;
