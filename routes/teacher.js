var express = require('express');
var app = express();
// SHOW LIST OF classes
module.exports = function(passport) {
  app.get('/', function(req, res, next) {
    req.getConnection(function(error, conn) {
      conn.query('SELECT * FROM teacher_dashboard ORDER BY id DESC', function(err, rows, fields) {
        //if(err) throw err
        if (err) {
          req.flash('error', err);
          res.render('teachers/teacherlist', {
            title: 'Teacher List',
            data: '',
          });
        } else {
          // render to views/user/list.ejs template file
          res.render('teachers/teacherlist', {
            title: 'Teacher List',
            data: rows,
          });
        }
      });
    });
  });

  //SHOW ADD Teacher FORM
  app.get('/addteacher', function(req, res, next) {
    // render to views/user/add.ejs
    res.render('teachers/addteacher', {
      title: 'Add Teacher',
      teacher_id: '',
      teacher_name: '',
      teacher_role: '',
      teacher_qualification: '',
    });
  });

  // ADD NEW Teacher POST ACTION
  app.post('/addteacher', function(req, res, next) {
    req.assert('teacher_id', 'Teacher ID is required').notEmpty();
    req.assert('teacher_name', 'Teacher Name is required').notEmpty();
    req.assert('teacher_role', 'Teacher Role is required').notEmpty();
    req.assert('teacher_qualification', 'Teacher Qualification is required').notEmpty();

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
      var tcr = {
        teacher_id: req
          .sanitize('teacher_id')
          .escape()
          .trim(),
        teacher_name: req
          .sanitize('teacher_name')
          .escape()
          .trim(),
        teacher_role: req
          .sanitize('teacher_role')
          .escape()
          .trim(),
        teacher_qualification: req
          .sanitize('teacher_qualification')
          .escape()
          .trim(),
      };

      req.getConnection(function(error, conn) {
        conn.query('INSERT INTO teacher_dashboard SET ?', tcr, function(err, result) {
          //if(err) throw err
          if (err) {
            req.flash('error', err);

            // render to views/user/add.ejs
            res.render('teachers/addteacher', {
              title: 'Add Teacher',
              teacher_id: tcr.teacher_id,
              teacher_name: tcr.teacher_name,
              teacher_role: tcr.teacher_role,
              teacher_qualification: tcr.teacher_qualification,
            });
          } else {
            req.flash('success', 'Data added successfully!');

            // render to views/user/add.ejs
            res.render('teachers/addteacher', {
              title: 'Add Teacher',
              teacher_id: '',
              teacher_name: '',
              teacher_role: '',
              teacher_qualification: '',
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

      res.render('teachers/addteacher', {
        title: 'Add Teacher',
        teacher_id: req.body.teacher_id,
        teacher_name: req.body.teacher_name,
        teacher_role: req.body.teacher_role,
        teacher_qualification: req.body.teacher_qualification,
      });
    }
  });

  // SHOW EDIT USER FORM
  app.get('/editteacher/(:id)', function(req, res, next) {
    req.getConnection(function(error, conn) {
      conn.query('SELECT * FROM teacher_dashboard WHERE id = ' + req.params.id, function(err, rows, fields) {
        if (err) throw err;

        // if class not found
        if (rows.length <= 0) {
          req.flash('error', 'Teacher not found with id = ' + req.params.id);
          res.redirect('/teacher');
        } else {
          // if class found
          // render to views/classes/editclass.ejs template file
          res.render('teachers/editteacher', {
            title: 'Edit Teachers',
            //data: rows[0],
            id: rows[0].id,
            teacher_id: rows[0].teacher_id,
            teacher_name: rows[0].teacher_name,
            teacher_role: rows[0].teacher_role,
            teacher_qualification: rows[0].teacher_qualification,
          });
        }
      });
    });
  });

  // EDIT classes POST ACTION
  app.put('/editteacher/:id', function(req, res, next) {
    req.assert('teacher_id', 'Teacher Id is required').notEmpty();
    req.assert('teacher_name', 'Teacher Name is required').notEmpty(); //Validate name
    req.assert('teacher_role', 'Teacher Role is required').notEmpty(); //Validate name
    req.assert('teacher_qualification', 'Teacher Qualification is required').notEmpty(); //Validate name

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
      var tcr = {
        teacher_id: req
          .sanitize('teacher_id')
          .escape()
          .trim(),
        teacher_name: req
          .sanitize('teacher_name')
          .escape()
          .trim(),
        teacher_role: req
          .sanitize('teacher_role')
          .escape()
          .trim(),
        teacher_qualification: req
          .sanitize('teacher_qualification')
          .escape()
          .trim(),
      };

      req.getConnection(function(error, conn) {
        console.log(req.params);

        conn.query('UPDATE teacher_dashboard SET ? WHERE id = ' + req.params.id, tcr, function(err, result) {
          //if(err) throw err
          if (err) {
            req.flash('error', err);

            // render to views/user/add.ejs
            res.render('teachers/editteacher', {
              title: 'Edit Teacher',
              teacher_id: req.body.teacher_id,
              teacher_name: req.body.teacher_name,
              teacher_role: req.body.teacher_role,
              teacher_qualification: req.body.teacher_qualification,
            });
          } else {
            req.flash('success', 'Data updated successfully!');

            conn.query('SELECT * FROM teacher_dashboard ORDER BY id DESC', function(err, rows, fields) {
              //if(err) throw err
              if (err) {
                req.flash('error', err);
                res.render('teachers/teacherlist', {
                  title: 'Teacher List',
                  data: '',
                });
              } else {
                // render to views/user/list.ejs template file
                res.render('teachers/teacherlist', {
                  title: 'Teacher List',
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

      res.render('teachers/editteacher', {
        title: 'Edit Teacher',

        teacher_id: req.body.teacher_id,
        teacher_name: req.body.teacher_name,
        teacher_role: req.body.teacher_role,
        teacher_qualification: req.body.teacher_qualification,
      });
    }
  });

  // DELETE Class
  app.delete('/delete/(:id)', function(req, res, next) {
    var tcr = { id: req.params.id };

    req.getConnection(function(error, conn) {
      conn.query('DELETE FROM teacher_dashboard WHERE id = ' + req.params.id, tcr, function(err, result) {
        //if(err) throw err
        if (err) {
          req.flash('error', err);
          // redirect to users list page
          res.redirect('/teacher');
        } else {
          req.flash('success', 'User deleted successfully! id = ' + req.params.id);
          // redirect to users list page
          res.redirect('/teacher');
        }
      });
    });
  });
  return app;
};
