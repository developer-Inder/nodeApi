var express = require('express');
var app = express();
module.exports = function(passport) {
  // SHOW LIST OF classes
  app.get('/', function(req, res, next) {
    res.render('home/home', {
      title: 'Class List',
      data: '',
    });
  });
  app.get('/home', function(req, res) {
    // render to views/index.ejs template file
    res.render('home/home', { title: 'Application R.E.B' });
  });
  // SHOW ADD Class FORM
  app.get('/homepage', function(req, res, next) {
    // render to views/user/add.ejs
    res.render('home/homepage', {
      title: 'Add New Class',
      class_id: '',
      name: '',
    });
  });
  return app;
};
