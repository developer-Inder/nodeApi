var express = require('express');
var app = express();
module.exports = function(passport) {
  // SHOW LIST OF USERS
  app.get('/', function(req, res, next) {
    req.getConnection(function(error, conn) {
      conn.query('SELECT * FROM user_details ORDER BY id DESC', function(err, rows, fields) {
        //if(err) throw err
        if (err) {
          req.flash('error', err);
          res.render('user/list', {
            title: 'User List',
            data: '',
          });
        } else {
          // render to views/user/list.ejs template file
          res.render('user/list', {
            title: 'User List',
            data: rows,
          });
        }
      });
    });
  });

  // SHOW ADD USER FORM
  app.get('/add', function(req, res, next) {
    // render to views/user/add.ejs
    res.render('user/add', {
      title: 'Add New User',
      name: '',
      email: '',
      user_type: '',
      password: '',
      phone: '',
    });
  });

  // ADD NEW USER POST ACTION
  app.post('/add', function(req, res, next) {
    req.assert('name', 'Name is required').notEmpty(); //Validate name
    req.assert('email', 'A valid email is required').isEmail();
    req.assert('user_type', 'User Type is Required').notEmpty(); //Validate email
    req.assert('password', 'Password is required').notEmpty(); //Validate
    req.assert('phone', 'Phone is required').notEmpty(); //Validate phone

    var errors = req.validationErrors();

    if (!errors) {
      //No errors were found.  Passed Validation!

      /********************************************
         * Express-validator module
         
        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';
 
        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
      var user = {
        name: req
          .sanitize('name')
          .escape()
          .trim(),
        email: req
          .sanitize('email')
          .escape()
          .trim(),
        user_type: req
          .sanitize('user_type')
          .escape()
          .trim(),
        password: req
          .sanitize('password')
          .escape()
          .trim(),
        phone: req
          .sanitize('phone')
          .escape()
          .trim(),
      };

      req.getConnection(function(error, conn) {
        conn.query('INSERT INTO user_details SET ?', user, function(err, result) {
          //if(err) throw err
          if (err) {
            req.flash('error', err);

            // render to views/user/add.ejs
            res.render('user/add', {
              title: 'Add New User',
              name: user.name,
              email: user.email,
              user_type: user.user_type,
              password: user.password,
              phone: user.phone,
            });
          } else {
            req.flash('success', 'Data added successfully!');

            // render to views/user/add.ejs
            res.render('user/add', {
              title: 'Add New User',
              name: '',
              email: '',
              user_type: '',
              password: '',
              phone: '',
            });
          }
        });
      });
    } else {
      //Display errors to user
      var error_msg = '';
      errors.forEach(function(error) {
        error_msg += error.msg + '<br>';
      });
      req.flash('error', error_msg);

      /**
       * Using req.body.name
       * because req.param('name') is deprecated
       */

      res.render('user/add', {
        title: 'Add New User',
        name: req.body.name,
        email: req.body.email,
        user_type: req.body.user_type,
        password: req.body.password,
        phone: req.body.phone,
      });
    }
  });

  // SHOW EDIT USER FORM
  app.get('/edit/(:id)', function(req, res, next) {
    req.getConnection(function(error, conn) {
      conn.query('SELECT * FROM user_details WHERE id = ' + req.params.id, function(err, rows, fields) {
        if (err) throw err;

        // if user not found
        if (rows.length <= 0) {
          req.flash('error', 'User not found with id = ' + req.params.id);
          res.redirect('/users');
        } else {
          // if user found
          // render to views/user/edit.ejs template file
          res.render('user/edit', {
            title: 'Edit User',
            //data: rows[0],
            id: rows[0].id,
            name: rows[0].name,
            email: rows[0].email,
            user_type: rows[0].user_type,
            password: rows[0].password,
            phone: rows[0].phone,
          });
        }
      });
    });
  });

  // EDIT USER POST ACTION
  app.put('/edit/:id', function(req, res, next) {
    req.assert('name', 'Name is required').notEmpty(); //Validate name
    req.assert('email', 'A valid email is required').isEmail();
    req.assert('user_type', 'User type is required').notEmpty();
    req.assert('password', 'Password is required').notEmpty(); //Validate password
    req.assert('phone', 'Phone is required').notEmpty();

    var errors = req.validationErrors();

    if (!errors) {
      //No errors were found.  Passed Validation!

      /********************************************
         * Express-validator module
         
        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';
 
        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
      var user = {
        name: req
          .sanitize('name')
          .escape()
          .trim(),
        email: req
          .sanitize('email')
          .escape()
          .trim(),
        user_type: req
          .sanitize('user_type')
          .escape()
          .trim(),
        password: req
          .sanitize('password')
          .escape()
          .trim(),
        phone: req
          .sanitize('phone')
          .escape()
          .trim(),
      };

      req.getConnection(function(error, conn) {
        console.log(req.params);

        conn.query('UPDATE user_details SET ? WHERE id = ' + req.params.id, user, function(err, result) {
          //if(err) throw err
          if (err) {
            req.flash('error', err);

            // render to views/user/add.ejs
            res.render('user/edit', {
              title: 'Edit User',
              name: req.body.name,
              email: req.body.email,
              user_type: req.body.user_type,
              password: req.body.password,
              phone: req.body.phone,
            });
          } else {
            req.flash('success', 'Data updated successfully!');

            conn.query('SELECT * FROM user_details ORDER BY id DESC', function(err, rows, fields) {
              //if(err) throw err
              if (err) {
                req.flash('error', err);
                res.render('user/list', {
                  title: 'User List',
                  data: '',
                });
              } else {
                // render to views/user/list.ejs template file
                res.render('user/list', {
                  title: 'User List',
                  data: rows,
                });
              }
            });
          }
        });
      });
    } else {
      //Display errors to user
      var error_msg = '';
      errors.forEach(function(error) {
        error_msg += error.msg + '<br>';
      });
      req.flash('error', error_msg);

      /**
       * Using req.body.name
       * because req.param('name') is deprecated
       */

      res.render('user/edit', {
        title: 'Edit User',

        name: req.body.name,
        email: req.body.email,
        user_type: req.body.user_type,
        password: req.body.password,
        phone: req.body.phone,
      });
    }
  });

  // DELETE USER
  app.delete('/delete/(:id)', function(req, res, next) {
    var user = { id: req.params.id };

    req.getConnection(function(error, conn) {
      conn.query('DELETE FROM user_details WHERE id = ' + req.params.id, user, function(err, result) {
        //if(err) throw err
        if (err) {
          req.flash('error', err);
          // redirect to users list page
          res.redirect('/users');
        } else {
          req.flash('success', 'User deleted successfully! id = ' + req.params.id);
          // redirect to users list page
          res.redirect('/users');
        }
      });
    });
  });
};
