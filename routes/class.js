var express = require('express');
var app = express();
const { database } = require('../utils/db.js');
module.exports = function(passport) {
  // SHOW LIST OF classes
  app.get('/class-list', async function(req, res, next) {
    var query = 'SELECT * FROM `tbl_standards` ORDER BY id DESC';
    results = await database.query(query, []);
    if (!results.length) {
      res.render('admin/classes/listclass', {
        title: 'Class List',
      });
      console.log('empty results', results);
    } else {
      res.render('admin/classes/listclass', {
        title: 'Class List',
        data: JSON.parse(results),
      });
    }
  });

  // SHOW ADD Class FORM
  app.get('/addclass', async function(req, res, next) {
    var query = 'SELECT * FROM tbl_boards ORDER BY id DESC';
    results = await database.query(query, []);

    res.render('admin/classes/addclass', {
      title: 'New Class',
      class_id: '',
      data: JSON.parse(results),
    });
  });

  app.get('/show_class', async function(req, res, next) {
    var query = 'SELECT * FROM tbl_standards where id = ' + req.query.id;
    results = await database.query(query, []);
    //res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);
  });

  // ADD NEW USER POST ACTION
  app.post('/addclass', async function(req, res, next) {
    req.assert('name', 'Class Name is required').notEmpty(); //Validate class name
    var errors = req.validationErrors();
    if (!errors) {
      var cl = {
        name: req
          .sanitize('name')
          .escape()
          .trim(),
      };

      var query = 'INSERT INTO tbl_standards SET ?';
      results = await database.query(query, [cl]);
      if (results) {
        req.flash('success', 'Class added successfully!');
        res.redirect('/admin/class/class-list');
      } else {
        req.flash('error', 'Class Addition failed!');
        res.render('admin/classes/addclass');
      }
    } else {
      //Display errors to user
      var error_msg = '';
      errors.forEach(function(error) {
        error_msg += error.msg + '<br>';
      });
      req.flash('error', error_msg);

      res.render('admin/classes/addclass', {
        title: 'Add New Class',
        class_id: '',
        name: '',
      });
    }
  });

  // SHOW EDIT USER FORM
  // app.get('/editclass/(:id)', function(req, res, next){
  //     req.getConnection(function(error, conn) {
  //         conn.query('SELECT * FROM classes WHERE id = ' + req.params.id, function(err, rows, fields) {
  //             if(err) throw err

  //             // if class not found
  //             if (rows.length <= 0) {
  //                 req.flash('error', 'Class not found with id = ' + req.params.id)
  //                 res.redirect('/class')
  //             }
  //             else { // if class found
  //                 // render to views/classes/editclass.ejs template file
  //                 res.render('admin/classes/editclass', {
  //                     title: 'Edit Class',
  //                     //data: rows[0],
  //                     id: rows[0].id,
  //                     class_id: rows[0].class_id,
  //                     name: rows[0].name,
  //                 })
  //             }
  //         })
  //     })
  // })

  // EDIT classes POST ACTION
  // app.put('/editclass/:id', function(req, res, next) {
  //     req.assert('class_id', 'Class-ID is required').notEmpty()           //Validate name
  //     req.assert('name', 'Class-Name is required').notEmpty()

  //     var errors = req.validationErrors()

  //     if( !errors ) {   //No errors were found.  Passed Validation!

  //         /********************************************
  //          * Express-validator module

  //         req.body.comment = 'a <span>comment</span>';
  //         req.body.username = '   a user    ';

  //         req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
  //         req.sanitize('username').trim(); // returns 'a user'
  //         ********************************************/
  //         var cl = {
  //             class_id: req.sanitize('class_id').escape().trim(),
  //             name: req.sanitize('name').escape().trim(),

  //         }

  //         req.getConnection(function(error, conn) {
  //             console.log(req.params);

  //             conn.query('UPDATE classes SET ? WHERE id = ' + req.params.id, cl, function(err, result) {
  //                 //if(err) throw err
  //                 if (err) {
  //                     req.flash('error', err)

  //                     // render to views/user/add.ejs
  //                     res.render('classes/editclass', {
  //                         title: 'Edit class',
  //                         class_id: req.body.class_id,
  //                         name: req.body.name,
  //                     })
  //                 } else {
  //                     req.flash('success', 'Data updated successfully!')

  //                     conn.query('SELECT * FROM classes ORDER BY id DESC',function(err, rows, fields) {
  //                         //if(err) throw err
  //                         if (err) {
  //                             req.flash('error', err)
  //                             res.render('classes/listclass', {
  //                                 title: 'Class List',
  //                                 data: ''
  //                             })
  //                         } else {
  //                             // render to views/user/list.ejs template file
  //                             res.render('classes/listclass', {
  //                                 title: 'Class List',
  //                                 data: rows
  //                             })
  //                         }
  //                     })
  //                 }
  //             })
  //         })
  //     }
  //     else {   //Display errors to user
  //         var error_msg = ''
  //         errors.forEach(function(error) {
  //             error_msg += error.msg + '<br>'
  //         })
  //         req.flash('error', error_msg)

  //         /**
  //          * Using req.body.name
  //          * because req.param('name') is deprecated
  //          */
  //         res.render('classes/editclass', {
  //             title: 'Edit Class',

  //             class_id: req.body.class_id,
  //             name: req.body.name,
  //         })
  //     }
  // })

  // DELETE Class
  app.delete('/delete/(:id)', async function(req, res, next) {
    var cl = { id: req.params.id };

    var query = 'DELETE FROM tbl_standards WHERE id = ' + req.params.id;
    results = await database.query(query, [cl]);
    if (results) {
      req.flash('success', 'Class Deleted Successfully!');
      // redirect to users list page
      res.redirect('/admin/class/class-list');
    } else {
      req.flash('error', 'Class Not Deleted');
      // redirect to users list page
      res.redirect('/admin/class/class-list');
    }
  });
  return app;
};
