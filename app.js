const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');

const webhookRouter = require('./app/webhook/routes');
const confirmEmailRouter = require('./app/confirm-email/routes');
const acceptRouter = require('./app/accept/routes');

const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/webhook', webhookRouter);
app.use('/confirm-email', confirmEmailRouter);
app.use('/accept', acceptRouter);

module.exports = app;
