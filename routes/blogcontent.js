var express = require('express');
var app = express();
var es = require('../utils/es/esblog');
var bb = require('bodybuilder');
const { database } = require('../utils/db.js');
const { check, validationResult } = require('express-validator');

var helpers = require('../utils/helpers/helpers');
var eshelpers = require('../utils/es/helpers');

module.exports = function(passport) {
  app.get('/addblogtest', async (req, res) => {
    var body = {
      id: 1,
      title: 'In a filter context, a query clause answers the question ',
      text:
        'Filter context is in effect whenever a query clause is passed to a filter parameter, such as the  filter or must_not parameters in the bool query, the filter parameter in the constant_score query, or the filter aggregation.',
      type: 'post',
    };
    var response = await es.addToIndex('blogs', body);
    res.json(response);
  });
  app.get('/querytest', async (req, res) => {
    var body = {
      filter: {
        //  "bool": {
        //  "must": [
        //        {
        term: { _id: '9jmWaG0BLLuJDpSERk44' },
        //        },
        // {
        //     "bool": {
        //         "should": [
        //             {"term": {"color": "red"}},
        //             {"term": {"color": "blue"}}
        //         ]
        //     }
        // }
        //    ]
        //   }
      },
    };
    var result = await es.findAndOr('blogs', body);
    res.json(result);
  });
  app.post('/additems', async function(req, res, next) {
    console.log(req.body.item);
    var table_name = 'tbl_' + req.body.item_type;
    delete req.body.item.id;

    // req.assert('name', 'is required').notEmpty()         //Validate class name
    // var errors = req.validationErrors()
    // if (!errors) {
    var cl = {};
    Object.keys(req.body.item).map(key => {
      // console.log(req.sanitize(req.body.item[key]).escape())
      // cl[key] = req.sanitize(req.body.item[key]).escape().trim();
      cl[key] = req.body.item[key];
    });
    // var cl = {
    //     name: req.sanitize('name').escape().trim(),
    // }
    console.log('cl is ..', cl);

    var query = `INSERT INTO ${table_name} SET ?`;
    results = await database.query(query, [cl]);
    if (results) {
      var items = await database.query(`select * from  ${table_name}`, []);

      res.json({ success: 'Item added successfully!', items: items });
    } else {
      req.flash('error', 'Item Addition failed!');
      res.send({ boards: JSON.parse(boards) });
    }

    // }
    // else {   //Display errors to user
    //     var error_msg = ''
    //     errors.forEach(function (error) {
    //         error_msg += error.msg + '<br>'
    //     })
    //     req.flash('error', error_msg)
    //     console.log(error_msg)

    // }
  });

  app.get('/getitems', async function(req, res, next) {
    try {
      var table_name = 'tbl_' + req.query.item_type;
      var page = Math.abs(parseInt(req.query.page)) || 1;

      var per_page = 3;
      var limit = per_page;
      var offset = (page - 1) * per_page;
      var query = `SELECT * FROM ${table_name} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset} `;
      var total = await database.query(`select count(*) from ${table_name}`, []);
      // results.total = total
      results = await database.query(query, []);
      var resp = { results: JSON.parse(results), total: total, message: 'Saved Successfully!' };
      //res.writeHead(200, {'Content-Type': 'application/json'});
      res.send(resp);
    } catch (err) {
      res.send({ message: 'Failed', error: err });
    }
  });

  app.post('/updateitems', async function(req, res, next) {
    console.log(req.body);
    var table_name = 'tbl_' + req.body.item_type;
    // req.assert('name', 'is required').notEmpty()         //Validate class name
    // var errors = req.validationErrors()
    // if (!errors) {
    var id = req.body.item.id;
    delete req.body.item.id;

    var cl = {};
    Object.keys(req.body.item).map(key => {
      // console.log(req.sanitize(req.body.item[key]).escape())
      // cl[key] = req.sanitize(req.body.item[key]).escape().trim();
      cl[key] = req.body.item[key];
    });
    var keys = Object.keys(req.body.item);
    var queryString = '';
    keys.forEach((key, index, arr) => {
      queryString += key + " = '" + req.body.item[key] + "'";
      console.log(index);
      console.log(keys);
      if (keys.length > index + 1) queryString += ' , ';
    });
    var query = `UPDATE  ${table_name} SET ${queryString} where id=${id}`;
    results = await database.query(query, [cl]);
    if (results) {
      var boards = await database.query(`select * from ${table_name}`, []);
      res.json({ status: 'done', boards: JSON.parse(boards) });
    } else {
      //  var boards = await database.query('select * from tbl_boards', [])
      console.log('error', 'Board Addition failed!');
      //   res.json( { status="failed",boards: JSON.parse(boards) })
    }
  });
  ////// elasticsearch
  app.post('/addblog', async (req, res) => {
    console.log(req.body);
    req.body.title;
    var response = await es.addToIndex(req.body.index, req.body);
    var data = { status: 'ok', response: response };
    console.log(response);
    res.json(data);

    var hash = crypto
      .createHash('md5')
      .update(JSON.stringify(req.body))
      .digest('hex');
  });
  app.get('/filteritems', async (req, res) => {
    // console.log(bb().filter)
    var a = bb();
    var i = 0;
    var query = { querycontent1: 'queryvalue1', querycontent1: 'queryvalue2' };
    var filter = { filtercontent1: 'filtervalue1', filtercontent1: 'filtervalue2' };
    var obj = { query, filter };
    //  Object.keys(obj).forEach(async (fn)=>{
    //   var result1=  await  eshelpers.createFuncChain(bb, a[fn], obj[fn], i)
    //  })
    var result1 = eshelpers.testChain(a).build();
    console.log('hi');
    res.json(result1);
  });

  app.get('/esall', async (req, res) => {
    //  var a = await es.matchall('blogs',{})
    //  for(i=0; i<a; i++) {
    //      results[i] = a.hits.hits._source
    //  }
    //  res.json(a)
    var bb = require('bodybuilder');

    console.log(bb());
  });
  return app;
};
