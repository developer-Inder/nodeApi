var express = require('express');
var app = express();
session = require('express-session');
var url = require('url');
const { database } = require('../utils/db.js');
var queryfn = require('../utils/queryfn');
var colors = require('../utils/colors');
var utils = require('../utils/utils');
var es = require('../utils/es/es');
var indices = require('../utils/es/indices');
var eshelpers = require('../utils/es/helpers');
module.exports = function(passport) {
  app.get('/test', async (req, res) => {
    console.log(req.headers);
  });

  app.post('/addcontent', async function(req, res, next) {
    console.log(req.body);
    console.log(req.files);
    res.json({ status: ok });
  });
  app.get('/addbulk', async function(req, res, next) {
    //  res.render('atest/test')
    var index = req.body.indexName;
    var jsonFile = req.query.bulkFileName;

    var a = await es.addBulk('cities');
    console.log(a);
    res.end('added successfully');
  });

  app.post('/addtoindex', async (req, res) => {
    console.log('xxxxxxxxxxxxxxxxxxx remove it now', req.files);
    console.log(req.body);
    // please use the other package to encrypt
    var hash = crypto
      .createHash('md5')
      .update(JSON.stringify(req.body))
      .digest('hex');

    //save content in db with the hash field (having a unique constraint) If error return there.s a problem.
    var response = await es.addToIndex(req.body.index, req.body);
    var data = { status: 'ok', response: response };
    console.log(response);
    res.json(data);
  });
  app.get('/createindex', async (req, res) => {
    var indexName = req.query.name;
    var result = await indices.deleteIndex(indexName);

    res.json(result);
  });

  app.get('/deleteindex', async (req, res) => {
    var indexName = req.query.indexname;

    var result = await indices.createIndex(indexName);
    res.json(result);
  });

  app.get('/suggest', async function(req, res) {
    // declare the query object to search elastic search and return only 200 results from the first result found.
    // also match any data where the name is like the query string sent in
    console.log(req.query);

    var reqQuery = req.query.q;
    var i = 'content';

    finalquery = {
      suggest: {
        'my-suggestion': {
          text: req.query.q,
        },
      },
    };

    var result = await es.query(i, finalquery);
    console.log('logging result', result);
    res.json({ result: result });
  });

  app.get('/search', async function(req, res) {
    // declare the query object to search elastic search and return only 200 results from the first result found.
    // also match any data where the name is like the query string sent in
    console.log('query data is ...', req.query);

    var reqQuery = req.query.q;
    var i = req.query.i || 'content';
    var match_value = {
      content: reqQuery,
    };
    finalquery = { match: match_value };
    var match_all_query = { match_all: {} };

    finalquery = req.query.q ? finalquery : match_all_query;
    console.log(finalquery);
    let body = {
      // size: 200,
      // from: 0,
      query: finalquery,
    };

    var result = await es.query(i, body);
    console.log('logging result', result);
    res.json({ result: result });
  });
  app.get('/item/:num', (req, res) => {
    var kids = [20642063, 120642454, 220643069, 320641945, 420642015, 520641807, 620641519, 720641559, 820641678];
    var item = {
      by: 'akulbe',
      descendants: 132,
      id: 20641410,
      kids: kids,
      score: 445,
      time: 1565232754,
      title: 'Linux Journal Ceases Publication: An Awkward Goodbye',
      type: 'story',
      url: 'https://www.linuxjournal.com/',
    };
    res.json(item);
  });

  app.get('/frontend-data', async (req, res) => {
    // console.log('fornted-data route called...');
    var frontend_items = { boards: {}, subjects: {}, standards: {}, exams: {} };
    // var variableName = 'foo';
    // console.log(req.user);
    frontend_items = await queryfn.fillData(frontend_items);
    // console.log(req.currentUser);
    // var user_interests = await queryfn.getUserInterests(req.currentUser);
    // res.cookie('token', 'testtoken@gmail.com');
    res.json(frontend_items);
  });
  return app;
};
