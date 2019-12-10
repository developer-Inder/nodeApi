var express = require('express');
var app = express();
module.exports = function(passport) {
  // SHOW LIST OF classes
  app.get('/', function(req, res, next) {
    req.getConnection(function(error, conn) {
      conn.query('SELECT * FROM streams ORDER BY id DESC', function(err, rows, fields) {
        //if(err) throw err
        if (err) {
          req.flash('error', err);
          res.render('stream/streamlist', {
            title: 'Stream List',
            data: '',
          });
        } else {
          // render to views/user/list.ejs template file
          res.render('stream/streamlist', {
            title: 'Stream List',
            data: rows,
          });
        }
      });
    });
  });

  // SHOW ADD Class FORM
  app.get('/addstream', function(req, res, next) {
    // render to views/user/add.ejs
    res.render('stream/addstream', {
      title: 'Add Stream',
      stream_name: '',
    });
  });

  // ADD NEW Content POST ACTION
  app.post('/addstream', function(req, res, next) {
    req.assert('stream_name', 'Stream Name is required').notEmpty();
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
      var strm = {
        stream_name: req
          .sanitize('stream_name')
          .escape()
          .trim(),
      };

      req.getConnection(function(error, conn) {
        conn.query('INSERT INTO streams SET ?', strm, function(err, result) {
          //if(err) throw err
          if (err) {
            req.flash('error', err);

            // render to views/user/add.ejs
            res.render('stream/addstream', {
              title: 'Add Stream',
              stream_name: strm.stream_name,
            });
          } else {
            req.flash('success', 'Data added successfully!');

            // render to views/user/add.ejs
            res.render('stream/addstream', {
              title: 'Add Stream',
              stream_name: '',
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

      res.render('stream/addstream', {
        title: 'Add stream',
        stream_name: req.body.stream_name,
      });
    }
  });

  // SHOW EDIT USER FORM
  app.get('/editstream/(:id)', function(req, res, next) {
    req.getConnection(function(error, conn) {
      conn.query('SELECT * FROM streams WHERE id = ' + req.params.id, function(err, rows, fields) {
        if (err) throw err;

        // if class not found
        if (rows.length <= 0) {
          req.flash('error', 'Stream not found with id = ' + req.params.id);
          res.redirect('/streams');
        } else {
          // if class found
          // render to views/classes/editclass.ejs template file
          res.render('stream/editstream', {
            title: 'Edit Stream',
            //data: rows[0],
            id: rows[0].id,
            stream_name: rows[0].stream_name,
          });
        }
      });
    });
  });

  // EDIT classes POST ACTION
  app.put('/editstream/:id', function(req, res, next) {
    req.assert('stream_name', 'Stream Name is required').notEmpty(); //Validate name

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
      var strm = {
        stream_name: req
          .sanitize('stream_name')
          .escape()
          .trim(),
      };

      req.getConnection(function(error, conn) {
        console.log(req.params);

        conn.query('UPDATE streams SET ? WHERE id = ' + req.params.id, strm, function(err, result) {
          //if(err) throw err
          if (err) {
            req.flash('error', err);

            // render to views/user/add.ejs
            res.render('stream/editstream', {
              title: 'Edit Stream',
              stream_name: req.body.stream_name,
            });
          } else {
            req.flash('success', 'Data updated successfully!');

            conn.query('SELECT * FROM streams ORDER BY id DESC', function(err, rows, fields) {
              //if(err) throw err
              if (err) {
                req.flash('error', err);
                res.render('stream/streamlist', {
                  title: 'Stream List',
                  data: '',
                });
              } else {
                // render to views/user/list.ejs template file
                res.render('stream/streamlist', {
                  title: 'Stream List',
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

      res.render('stream/editstream', {
        title: 'Edit Stream',

        stream_name: req.body.stream_name,
      });
    }
  });

  // DELETE Class
  app.delete('/delete/(:id)', function(req, res, next) {
    var strm = { id: req.params.id };

    req.getConnection(function(error, conn) {
      conn.query('DELETE FROM streams WHERE id = ' + req.params.id, strm, function(err, result) {
        //if(err) throw err
        if (err) {
          req.flash('error', err);
          // redirect to users list page
          res.redirect('/streams');
        } else {
          req.flash('success', 'User deleted successfully! id = ' + req.params.id);
          // redirect to users list page
          res.redirect('/streams');
        }
      });
    });
  });
  return app;
};
