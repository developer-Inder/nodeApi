var express = require('express');
var app = express();
const { database } = require('../utils/db.js');

// SHOW LIST OF classes
module.exports = function(passport) {
  app.get('/exam_list', async function(req, res, next) {
    var query = 'select * from tbl_exam_type ORDER BY id ASC';
    //if(err) throw err
    results = await database.query(query, []);
    res.render('admin/exam/exam_list', {
      title: 'Add Exam',
      data: JSON.parse(results),
    });
  });

  // SHOW ADD exam FORM
  app.get('/add_exam', async function(req, res, next) {
    // render to views/user/add.ejs
    var query = 'select * from tbl_exam_type ORDER BY id ASC';
    results = await database.query(query, []);
    res.render('admin/exam/add_exam', {
      title: 'Add Exam',
      data: JSON.parse(results),
    });
  });
  // SHOW ADD exam type FORM
  app.get('/add_exam_type', async function(req, res, next) {
    var query = 'select * from tbl_exam_type ORDER BY id ASC';
    results = await database.query(query, []);
    res.render('admin/exam/add_exam_type', {
      title: 'Add content',
      data: JSON.parse(results),
    });
  });

  app.get('/showexam', async function(req, res, next) {
    var query = 'SELECT * FROM tbl_exams where exam_type_id = ' + req.query.id;
    results = await database.query(query, []);
    // res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);
  });

  // ADD NEW EXAM TYPE POST ACTION
  app.post('/addexamtype', async function(req, res, next) {
    req.assert('exam_type', 'Exam Type is required').notEmpty();

    var errors = req.validationErrors();

    if (!errors) {
      var exm = {
        exam_type: req
          .sanitize('exam_type')
          .escape()
          .trim(),
      };

      var query = 'INSERT INTO tbl_exam_type SET ?';

      results = await database.query(query, [exm]);

      if (results) {
        req.flash('success', 'Exam Type added successfully!');
        res.redirect('/admin/exam/add_exam_type');
      } else {
        req.flash('error', 'Exam Type Addition failed!');
        res.render('admin/exam/add_exam_type');
      }
    } else {
      //Display errors to user
      var error_msg = '';
      errors.forEach(function(error) {
        error_msg += error.msg + '<br>';
      });
      req.flash('error', error_msg);

      res.render('admin/exam/add_exam_type', {
        title: 'Add New Class',
        class_id: '',
        name: '',
      });
    }
  });

  // ADD NEW Content POST ACTION
  app.post('/addexam', async function(req, res, next) {
    req.assert('exam_type', 'Exam Type is required').notEmpty();
    req.assert('exam_name', 'Exam Name is required').notEmpty();
    req.assert('exam_desc', 'Exam Description is required').notEmpty();
    req.assert('eligib_crit', 'Eligibility Criteria is required').notEmpty();
    req.assert('exam_apply', 'How To Apply is required').notEmpty();
    req.assert('exam_prep', 'Preparation Tips is required').notEmpty();

    var errors = req.validationErrors();

    if (!errors) {
      var exm = {
        exam_name: req
          .sanitize('exam_name')
          .escape()
          .trim(),
        exam_type_id: req
          .sanitize('exam_type')
          .escape()
          .trim(),
        exam_decription: req
          .sanitize('exam_desc')
          .escape()
          .trim(),
        eligibility: req
          .sanitize('eligib_crit')
          .escape()
          .trim(),
        how_to_apply: req
          .sanitize('exam_apply')
          .escape()
          .trim(),
        exam_preparation: req
          .sanitize('exam_prep')
          .escape()
          .trim(),
      };

      var query = 'INSERT INTO tbl_exams SET ?';

      results = await database.query(query, [exm]);

      if (results) {
        req.flash('success', 'Exam added successfully!');
        res.redirect('/admin/exam/add_exam');
      } else {
        req.flash('error', 'Exam Addition failed!');
        res.render('admin/exam/add_exam');
      }
    } else {
      //Display errors to user
      var error_msg = '';
      errors.forEach(function(error) {
        error_msg += error.msg + '<br>';
      });
      req.flash('error', error_msg);

      res.render('admin/exam/add_exam', {
        title: 'Add New Class',
        class_id: '',
        name: '',
      });
    }
  });

  // SHOW EDIT USER FORM
  app.get('/examedit', async function(req, res, next) {
    var editexam;
    var mydata;
    var query = 'select * from tbl_exam_type ORDER BY id ASC';
    editexam = await database.query(query, []);
    var query = 'select * from tbl_exams WHERE id=' + req.query.eid;
    //console.log(query);
    mydata = await database.query(query, []);
    var id = JSON.parse(mydata);
    // console.log('sdf');
    var data = {
      mydata: JSON.parse(mydata),
      editexam: JSON.parse(editexam),
    };
    res.render('admin/exam/edit_exam', {
      title: 'Edit Exam',
      data: data,
    });
  });

  // EDIT classes POST ACTION
  app.post('/edit_exams', async function(req, res, next) {
    //var sbj = { id: req.params.id }
    req.assert('edit_exam_type', 'Exam Type is required').notEmpty(); //Validate name
    req.assert('edit_exam_name', 'Exam Name is required').notEmpty();
    req.assert('edit_exam_desc', 'Exam Description is required').notEmpty();
    req.assert('edit_eligib_crit', 'Eligibility Criteria is required').notEmpty();
    req.assert('edit_exam_apply', 'How To Apply is required').notEmpty();
    req.assert('edit_exam_prep', 'Preparation Tips is required').notEmpty();

    var errors = req.validationErrors();

    if (!errors) {
      var exm = {
        exam_type_id: req
          .sanitize('edit_exam_type')
          .escape()
          .trim(),
        exam_name: req
          .sanitize('edit_exam_name')
          .escape()
          .trim(),
        exam_decription: req
          .sanitize('edit_exam_desc')
          .escape()
          .trim(),
        eligibility: req
          .sanitize('edit_eligib_crit')
          .escape()
          .trim(),
        how_to_apply: req
          .sanitize('edit_exam_apply')
          .escape()
          .trim(),
        exam_preparation: req
          .sanitize('edit_exam_prep')
          .escape()
          .trim(),
      };

      var query = 'UPDATE tbl_exams SET ? WHERE id = ' + req.query.id;
      results = await database.query(query, [exm]);
      if (results) {
        req.flash('success', 'Data Updated successfully!');
        res.redirect('/admin/exam/exam_list');
      } else {
        req.flash('error', 'Datas Updation failed!');
        res.render('admin/exam/exam_list');
      }
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
      res.render('exams/editexam', {
        title: 'Edit Exam',

        exam_id: req.body.exam_id,
        exam_name: req.body.exam_name,
        field: req.body.field,
        stream: req.body.stream,
      });
    }
  });

  // DELETE Class
  app.get('/exam_type_delete', async function(req, res, next) {
    var sbj = { id: req.params.id };

    var query = 'DELETE FROM  tbl_exam_type WHERE id = ' + req.query.id;
    results = await database.query(query, [sbj]);
    if (results) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      var obj = { success: 1, message: 'Exam Type Deleted successfully!!' };
      res.end(JSON.stringify(obj));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      var obj = { success: 0, message: 'Exam Type Not Deleted!!' };
      res.end(JSON.stringify(obj));
    }
  });

  app.get('/examdelete', async function(req, res, next) {
    var sbj = { id: req.params.id };

    var query = 'DELETE FROM  tbl_exams WHERE id = ' + req.query.id;
    results = await database.query(query, [sbj]);
    if (results) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      var obj = { success: 1, message: 'Exam Deleted successfully!!' };
      res.end(JSON.stringify(obj));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      var obj = { success: 0, message: 'Exam Not Deleted!!' };
      res.end(JSON.stringify(obj));
    }
  });
  return app;
};
