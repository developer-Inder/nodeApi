var express = require('express');
var app = express();
var crypto = require('crypto');
var utils = require('../utils/utils');
var config = require('../config/config')
var jwt = require('jsonwebtoken');

module.exports = function (passport) {
  const { database } = require('../utils/db.js');

  // SHOW ADMIN LOGIN FORM
  app.post('/user_registration', async function (req, res, next) {
    req.assert('fname', 'First Name is required').notEmpty(); //Validate id
    req.assert('email', 'Email is required').notEmpty(); //Validate class name
    req.assert('phone', 'Phone is required').notEmpty();
    req.assert('password', 'Password is required').notEmpty(); //Validate class name

    var errors = req.validationErrors();

    if (!errors) {
      var fld = {
        first_name: req
          .sanitize('fname')
          .escape()
          .trim(),
        last_name: req
          .sanitize('lname')
          .escape()
          .trim(),
        email: req
          .sanitize('email')
          .escape()
          .trim(),
        phone: req
          .sanitize('phone')
          .escape()
          .trim(),
        password: req
          .sanitize('password')
          .escape()
          .trim(),
        // role: 'U',
      };

      var query = 'INSERT INTO tbl_user  SET ? ';
      results = await database.query(query, [fld]);
      if (results) {
        // req.flash('success', 'User deleted successfully! id = ' + req.params.id)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        var obj = { success: 1, message: 'Registration Done Successfully!!' };
        res.end(JSON.stringify(obj));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        var obj = { success: 0, message: 'Registration Failed!! ' };
        res.end(JSON.stringify(obj));
      }
    } else {
      var obj = { success: 0, message: 'Something went wrong!! ' };
      res.end(JSON.stringify(obj));
    }
  });

  app.post('/start', async function (req, res, next) {
    var checkEmail = await database.query('SELECT count(id) as ids FROM tbl_user where email = ? ', [req.body.email], 1);
    var checkEmail = JSON.parse(checkEmail);
    if (checkEmail.ids < 1) {
      req.assert('name', 'Name is required').notEmpty(); //Validate id
      req.assert('email', 'Email is required').notEmpty(); //Validate class name
      var errors = req.validationErrors();
      // var token = crypto.createHash('sha256').update(req.body.email).digest('base64');
      var token = jwt.sign({ email: req.body.email }, config.jwt_secret, {
        expiresIn: 3000000
      });
      if (!errors) {
        var fld = {
          first_name: req
            .sanitize('name')
            .escape()
            .trim(),
          email: req
            .sanitize('email')
            .escape()
            .trim(),
          hash: token,
        };
        await utils.sendMail(req.body.email, token)
        var query = 'INSERT INTO tbl_user  SET ? ';
        results = await database.query(query, [fld]);
        if (results) {
          // req.flash('success', 'User deleted successfully! id = ' + req.params.id)
          res.writeHead(200, { 'Content-Type': 'application/json' });
          var obj = { success: 1, message: 'Registration Done Successfully please check email !!' };
          res.end(JSON.stringify(obj));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          var obj = { success: 0, message: 'Registration Failed!! ' };
          res.end(JSON.stringify(obj));
        }
      } else {
        var obj = { success: 0, message: 'Something went wrong!! ' };
        res.end(JSON.stringify(obj));
      }
    } else {
      var obj = { success: 0, message: 'Email already registered please check and try again later..!! ' };
      res.end(JSON.stringify(obj));
    }
  });

  app.post('/verify', async function (req, res, next) {
    req.assert('token', 'token is required').notEmpty(); //Validate id
    var errors = req.validationErrors();
    if (!errors) {
      var token = await utils.verifyToken(req.body.token, config.jwt_secret, async function (err, decoded) {
        console.log(err)
        console.log(decoded)
        var email = decoded.email
        var user = await database.query('SELECT * from `tbl_user`  where `email` = ?', [email], 1);
        
        // console.log("user : ", )
        var user = JSON.parse(user)
        var email = user.email
        var id = user.id
        console.log(email)
        console.log(id)
        if (user) {
          var verify_id = 1
          var emailVerify = await database.query('UPDATE `tbl_user` SET `verified`= ?  where email = ? && id = ? ', [verify_id, email, id]);
          // console.log(emailVerify)
          if (emailVerify.affectedRows > 0) {
            var obj = { success: true, message: 'Email verified.', token: user.hash, email: email };
            res.end(JSON.stringify(obj));
          }
          else {
            var obj = { success: 0, message: 'Email not verified please check and try again later..!!' };
            res.end(JSON.stringify(obj));
          }
          // console.log("token", token)
        }
      });
    }
    });
      app.post('/userdata', async function (req, res, next) {
        // console.log('hi')
        req.assert('username', 'Name is required').notEmpty(); //Validate name
        req.assert('password', 'Email is required').notEmpty(); //Validate password
        req.assert('token', 'Token is required').notEmpty();
        var errors = req.validationErrors();
        if (!errors) {

          var token = await utils.verifyToken(req.body.token, config.jwt_secret, async function (err, decoded) {
            console.log(decoded)
            var email = decoded.email
            var user = await database.query('UPDATE `tbl_user` SET `first_name`= ?,`password` = ?  where `email` = ?', [req.body.username, req.body.password, email]);
            console.log(user)
            if (user) {
              var obj = { success: true, message: 'User successfully registered' }
              res.end(JSON.stringify(obj));
            } 
          });
        }else{
          var obj = { success: true, message: 'required all fields' }
          res.end(JSON.stringify(obj));
        }
         
      });

      app.get('/checking', async function (req, res, next) {
        var email = await utils.sendMail('indersein@gmail.com')

        // console.log(data)
        console.log(email.response)
        res.json(email)
      });

      return app;
    };
