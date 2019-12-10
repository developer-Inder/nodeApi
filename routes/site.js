var express = require('express');
var app = express();
module.exports = function(passport) {
  // SHOW LIST OF classes
  app.get('/', function(req, res, next) {
    res.render('site/index', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('class-wise', function(req, res, next) {
    res.render('site/class-wise', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('subject-wise', function(req, res, next) {
    res.render('site/subject-wise', {
      title: 'Class List',
      data: 'this is site index',
    });
  });
  app.get('board-material', function(req, res, next) {
    res.render('site/board-material', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/categories/', function(req, res, next) {
    req.getConnection(function(error, conn) {
      var categories = [];
      conn.query('select id,name FROM tbl_categories', function(err, rows, fields) {
        req.getConnection(function(error, conn) {
          conn.query('select id,name FROM tbl_sub_categories where category_id = ' + req.query.id, function(
            err,
            srows,
            fields
          ) {
            var result = {};
            // console.log(result)
            res.render('site/category_display', {
              data: rows,
              sub_categories: srows,
            });
          });
        });
      });
    });
  });
  return app;
};
