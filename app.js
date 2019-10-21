var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var webhookRouter = require('./app/webhook/routes');
var confirmEmailRouter = require('./app/confirm-email/routes');
var acceptRouter = require('./app/accept/routes');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/webhook', webhookRouter);
app.use('/confirm-email', confirmEmailRouter);
app.use('/accept', acceptRouter);

module.exports = app;
