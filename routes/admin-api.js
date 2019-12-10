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
  app.get('/career/options', async function(req, res, next) {
    //  res.render('atest/test')
    var formArrays = {
      institutes: {
        keys: {
          name: null,
          address: null,
          phone: null,
          website: null,
        },
        data: [
          {
            name: 'Allen Kota',
            address: 'Kasturba Nagar, New Delhi',
            phone: '0164524587',
            website: 'www.example.com',
          },
          {
            name: 'Allen Kota',
            address: 'Kasturba Nagar, New Delhi',
            phone: '0164524587',
            website: 'www.example.com',
          },
        ],
      },
      contacts: {
        keys: {
          name: null,
          address: null,
          phone: null,
          website: null,
        },
        data: [
          {
            name: 'Allen Kota',
            address: 'Kasturba Nagar, New Delhi',
            phone: '0164524587',
            website: 'www.example.com',
          },
        ],
      },
      eligibility: {
        keys: {
          type: null,
          eligibility: null,
        },
        data: [
          {
            type: 'Education',
            eligibility: 'M.B.A from a recognized university',
          },
        ],
      },
      job_prospects: {
        keys: {
          description: null,
          salary: null,
        },
        data: [
          {
            description: 'Chief Technology Officer',
            salary: '$50,000',
          },
        ],
      },
    };
    res.json(formArrays);
  });

  return app;
};
