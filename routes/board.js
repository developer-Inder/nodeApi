var express = require('express');
var app = express();
const { database } = require('../utils/db.js');
const { check, validationResult } = require('express-validator');

module.exports = function(passport) {
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

    var query = 'INSERT INTO ' + table_name + ' SET ?';
    results = await database.query(query, [cl]);
    if (results) {
      var boards = await database.query('select * from tbl_boards', []);

      res.json({ success: 'Board added successfully!', boards: boards });
    } else {
      var boards = await database.query('select * from tbl_boards', []);

      req.flash('error', 'Board Addition failed!');
      res.render('admin/board/addboard', { boards: JSON.parse(boards) });
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
      var boards = await database.query('select * from tbl_boards', []);
      res.json({ status: 'done', boards: JSON.parse(boards) });
    } else {
      //  var boards = await database.query('select * from tbl_boards', [])
      console.log('error', 'Board Addition failed!');
      //   res.json( { status="failed",boards: JSON.parse(boards) })
    }

    // }
    // else {   //Display errors to user
    //     var error_msg = ''
    //     errors.forEach(function (error) {
    //         error_msg += error.msg + '<br>'
    //     })
    //     console.log('error',error_msg)

    // }
  });

  app.delete('/delete/(:id)', async function(req, res, next) {
    var cl = { id: req.params.id };

    var query = 'DELETE FROM tbl_boards WHERE id = ' + req.params.id;
    results = await database.query(query, [cl]);
    if (results) {
      req.flash('success', 'Board deleted successfully!');
      // redirect to users list page
      res.redirect('/admin/board/board-list');
    } else {
      req.flash('error', 'Board Not Deleted!');
      // redirect to users list page
      res.redirect('/admin/board/board-list');
    }
  });

  // SHOW LIST OF Boards
  app.get('/exam_list', async function(req, res, next) {
    var query = 'SELECT * FROM tbl_exams ORDER BY id DESC';
    results = await database.query(query, []);
    res.render('admin/board/boardlist', {
      title: 'Board List',
      data: JSON.parse(results),
    });
  });
  app.get('/getboards', async function(req, res, next) {
    var query = 'SELECT * FROM tbl_boards ORDER BY id DESC';
    results = await database.query(query, []);
    //res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);
  });
  // SHOW ADD BOARD FORM
  app.get('/addboard', async function(req, res, next) {
    // render to views/user/add.ejs
    var boards = await database.query('select * from tbl_boards', []);
    res.render('admin/board/addboard', {
      title: 'Add Eligibility',
      requirement: '',
      eligibility_type: '',
      value: '',
      unit: '',
      pursuing: '',
      category: '',
      gender: '',
      boards: JSON.parse(boards),
    });
  });

  app.post('/addboards', async function(req, res, next) {
    console.log(req.body);
    req.assert('name', 'Class Name is required').notEmpty(); //Validate class name
    var errors = req.validationErrors();
    if (!errors) {
      var cl = {
        name: req
          .sanitize('name')
          .escape()
          .trim(),
      };

      var query = 'INSERT INTO tbl_boards SET ?';
      results = await database.query(query, [cl]);
      if (results) {
        var boards = await database.query('select * from tbl_boards', []);

        res.json({ success: 'Board added successfully!', boards: boards });
      } else {
        var boards = await database.query('select * from tbl_boards', []);

        req.flash('error', 'Board Addition failed!');
        res.render('admin/board/addboard', { boards: JSON.parse(boards) });
      }
    } else {
      //Display errors to user
      var error_msg = '';
      errors.forEach(function(error) {
        error_msg += error.msg + '<br>';
      });
      req.flash('error', error_msg);
      console.log(error_msg);
    }
  });
  app.get('/updateboards', async function(req, res, next) {
    req.assert('name', 'Class Name is required').notEmpty(); //Validate class name
    var errors = req.validationErrors();
    if (!errors) {
      var cl = {
        name: req
          .sanitize('name')
          .escape()
          .trim(),
      };
      var keys = Object.keys(req.query);
      var queryString = '';
      keys.forEach((key, index, arr) => {
        queryString += key + " = '" + req.query[key] + "'";
        console.log(index);
        console.log(keys);
        if (keys.length > index + 1) queryString += ' and ';
      });
      var query = 'UPDATE  tbl_boards SET ' + queryString;
      results = await database.query(query, [cl]);
      if (results) {
        var boards = await database.query('select * from tbl_boards', []);
        // res.json( {status="done", boards: JSON.parse(boards) })
      } else {
        var boards = await database.query('select * from tbl_boards', []);
        req.flash('error', 'Board Addition failed!');
        //   res.json( { status="failed",boards: JSON.parse(boards) })
      }
    } else {
      //Display errors to user
      var error_msg = '';
      errors.forEach(function(error) {
        error_msg += error.msg + '<br>';
      });
      req.flash('error', error_msg);
      console.log(boards);
      res.render('admin/board/addboard', {
        title: 'Add New Board',
        class_id: '',
        name: '',
        boards: boards,
      });
    }
  });
  // SHOW EDIT USER FORM
  // app.get('/editeligibility/(:id)', function(req, res, next){
  //     req.getConnection(function(error, conn) {
  //         conn.query('SELECT * FROM eligibilities WHERE id = ' + req.params.id, function(err, rows, fields) {
  //             if(err) throw err

  //             // if class not found
  //             if (rows.length <= 0) {
  //                 req.flash('error', 'Eligibility not found with id = ' + req.params.id)
  //                 res.redirect('/eligible')
  //             }
  //             else { // if class found
  //                 // render to views/classes/editclass.ejs template file
  //                 res.render('eligibility/editeligibility', {
  //                     title: 'Edit Eligibilty',
  //                     //data: rows[0],
  //                     id: rows[0].id,
  //                     requirement: rows[0].requirement,
  //                     eligibility_type: rows[0].eligibility_type,
  //                     unit: rows[0].unit,
  //                     value: rows[0].value,
  //                     pursuing: rows[0].pursuing,
  //                     category: rows[0].category,
  //                     gender:rows[0].gender
  //                 })
  //             }
  //         })
  //     })
  // })

  // EDIT classes POST ACTION
  // app.put('/editeligibility/:id', function(req, res, next) {
  //     req.assert('requirement', 'Requirement is required').notEmpty()           //Validate name
  //     req.assert('eligibility_type', 'Eligibility Type  is required').notEmpty()
  //     req.assert('unit','Unit is required').notEmpty()
  //     req.assert('value','Value is required').notEmpty()
  //     req.assert('pursuing', 'Pursuing Details are required').notEmpty()
  //     req.assert('category', 'Category is required').notEmpty()
  //     req.assert('gender', 'Gender is required').notEmpty()

  //     var errors = req.validationErrors()

  //     if( !errors ) {   //No errors were found.  Passed Validation!

  //         /********************************************
  //          * Express-validator module

  //         req.body.comment = 'a <span>comment</span>';
  //         req.body.username = '   a user    ';

  //         req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
  //         req.sanitize('username').trim(); // returns 'a user'
  //         ********************************************/
  //         var elg = {
  //             requirement: req.sanitize('requirement').escape().trim(),
  //             eligibility_type: req.sanitize('eligibility_type').escape().trim(),
  //             unit: req.sanitize('unit').escape().trim(),
  //             value: req.sanitize('value').escape().trim(),
  //             pursuing: req.sanitize('pursuing').escape().trim(),
  //             category: req.sanitize('category').escape().trim(),
  //             gender: req.sanitize('gender').escape().trim(),

  //         }

  //         req.getConnection(function(error, conn) {
  //             console.log(req.params);

  //             conn.query('UPDATE eligibilities SET ? WHERE id = ' + req.params.id, elg, function(err, result) {
  //                 //if(err) throw err
  //                 if (err) {
  //                     req.flash('error', err)

  //                     // render to views/user/add.ejs
  //                     res.render('eligibility/editeligibility', {
  //                         title: 'Edit Eligibilities',
  //                         requirement: req.body.requirement,
  //                         eligibility_type: req.body.eligibility_type,
  //                         unit: req.body.unit,
  //                         value: req.body.value,
  //                         pursuing: req.body.pursuing,
  //                         category: req.body.category,
  //                         gender:req.body.gender
  //                     })
  //                 } else {
  //                     req.flash('success', 'Data updated successfully!')

  //                     conn.query('SELECT * FROM eligibilities ORDER BY id DESC',function(err, rows, fields) {
  //                         //if(err) throw err
  //                         if (err) {
  //                             req.flash('error', err)
  //                             res.render('eligibility/eligibilitylist', {
  //                                 title: 'Eligibility List',
  //                                 data: ''
  //                             })
  //                         } else {
  //                             // render to views/user/list.ejs template file
  //                             res.render('eligibility/eligibilitylist', {
  //                                 title: 'Eligibility List',
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
  //         res.render('eligibility/editeligibility', {
  //             title: 'Edit Eligibility',

  //             requirement: req.body.requirement,
  //             eligibility_type: req.body.eligibility_type,
  //             unit: req.body.unit,
  //             value: req.body.value,
  //             pursuing:req.body.pursuing,
  //             category: req.body.category,
  //             gender: req.body.gender,
  //         })
  //     }
  // })

  // DELETE Class

  return app;
};
