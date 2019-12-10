var express = require('express');
var app = express();
const { database } = require('../utils/db.js');
var cnt = require('connect-ensure-login');
var utils = require('../utils/utils');
// SHOW LIST OF Boards
module.exports = function(passport) {
  test = (req, res) => {
    res.status(403).json({ status: 'error', message: 'No Way!' });
  };
  app.get('/login', function(req, res, next) {
    console.log(req.query);
    res.json({ success: true, message: 'ok', token: 'my_token', user: { email: req.query.email } });
  });
  app.get('/testCookie', (req, res) => {
    res.cookie('token', 'testtoken@gmail.com');
    res.json(req.cookies);
  });
  app.post('/prot', utils.ensureLoggedIn, (req, res, next) => {
    console.log('reached protected method');
  });
  return app;
};
