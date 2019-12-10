var express = require('express');
var app = express();
module.exports = function(passport) {
  // Get content endpoint
  app.get('/category_list', function(req, res) {
    res.send("You can only see this after you've logged in.");
  });
  app.get('/categories', async function(req, res, next) {
    var query = 'SELECT * FROM tbl_categories ORDER BY id DESC';
    results = await database.query(query, []);
    if (!results.length) {
      res.render('admin/category/category_list', {
        title: 'Category List',
      });
      console.log('empty results', results);
    } else {
      res.render('admin/category/category_list', {
        title: 'Category List',
        data: JSON.parse(results),
      });
    }
  });
  // TO DELETE CATEGORIES
  app.get('/remove_category/', async function(req, res, next) {
    var query = 'delete FROM tbl_categories where id = ' + req.query.id;
    results = await database.query(query, []);
    if (results) {
      req.flash('success', 'Category Deleted successfully!');
      res.redirect('/admin/category/add-category');
    } else {
      req.flash('error', 'Category Not Deleted!');
      res.redirect('/admin/category/add-category');
    }
  });

  // Show ADD CATOGERY FORM
  app.get('/add-category', async function(req, res, next) {
    var query = 'SELECT * FROM tbl_categories ORDER BY id DESC';
    results = await database.query(query, []);
    if (!results.length) {
      res.render('admin/category/addcategory', {
        title: 'Category List',
      });
      //console.log("empty results", results)
    } else {
      res.render('admin/category/addcategory', {
        title: 'Category List',
        data: JSON.parse(results),
      });
    }
  });
  // TO ADD CATEGORY
  app.post('/add-category', async function(req, res, next) {
    req.assert('category_name', 'Class Name is required').notEmpty(); //Validate class name
    var errors = req.validationErrors();
    if (!errors) {
      var name = req
        .sanitize('category_name')
        .escape()
        .trim();
      var cl = {
        name: name,
        slug: str_replace(' ', '_', name),
        image: '',
      };

      var query = 'INSERT INTO tbl_categories SET ?';
      results = await database.query(query, [cl]);
      if (results) {
        req.flash('success', 'Category added successfully!');
        res.redirect('/admin/category/add-category');
      } else {
        req.flash('error', 'Category Addition failed!');
        res.redirect('admin/category/add-category');
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
      res.render('/admin/classes/addclass', {
        title: 'Add New Class',
        class_id: req.body.class_id,
        name: req.body.name,
      });
    }
  });

  /*to get sub categories*/
  app.get('/get_subcategories', async function(req, res, next) {
    var query = 'select * FROM tbl_sub_categories where category_id = ' + req.query.id;
    //res.writeHead(200, {'Content-Type': 'application/json'});
    results = await database.query(query, []);
    res.send(results);
  });

  /*to get nano categories*/
  app.get('/get_nanocategories', async function(req, res, next) {
    var query = 'select * FROM tbl_nano_category where sub_category_id = ' + req.query.id;
    // res.writeHead(200, {'Content-Type': 'application/json'});
    results = await database.query(query, []);
    res.send(results);
  });

  /*to get contents*/
  // app.get('/get_content', async function(req, res, next){

  //       var query ="SELECT tbl_content.id , tbl_content.type ,tbl_content.title ,tbl_content.description ,tbl_content.created_at , tbl_nano_category.name as nano_category ,tbl_sub_categories.name as sub_category ,tbl_categories.name as category from tbl_content INNER JOIN tbl_nano_category on tbl_content.nano_category_id = tbl_nano_category.id INNER JOIN tbl_sub_categories on tbl_nano_category.sub_category_id = tbl_sub_categories.id INNER JOIN tbl_categories on tbl_sub_categories.category_id = tbl_categories.id";

  //       //res.writeHead(200, {'Content-Type': 'application/json'});
  //       results = await database.query(query, [] );
  //       res.send(results);
  //     })

  /* to add new sub categories*/
  app.post('/sub-category', async function(req, res, next) {
    req.assert('name', 'Class Name is required').notEmpty();
    req.assert('category_id', 'category id  is required').notEmpty(); //Validate class name
    var errors = req.validationErrors();
    if (!errors) {
      var name = req
        .sanitize('name')
        .escape()
        .trim();
      var category_id = req
        .sanitize('category_id')
        .escape()
        .trim();
      var cl = {
        name: name,
        slug: str_replace(' ', '_', name),
        category_id: category_id,
      };

      var query =
        'INSERT INTO tbl_sub_categories SET name = "' +
        cl.name +
        '" , slug = "' +
        cl.slug +
        '" , category_id = "' +
        cl.category_id +
        '"';
      results = await database.query(query, [cl]);
      if (results) {
        req.flash('success', 'Sub Category added successfully!');
        res.redirect('/admin/category/sub_category');
      } else {
        req.flash('error', 'Sub Category Addition Failed!');
        res.redirect('/admin/category/sub_category');
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
      res.render('/admin/classes/addclass', {
        title: 'Add New Class',
        class_id: req.body.class_id,
        name: req.body.name,
      });
    }
  });

  // TO SHOW SUB CATEGORY FORM
  app.get('/sub_category', async function(req, res, next) {
    var query = 'SELECT * FROM tbl_categories ORDER BY id DESC';
    results = await database.query(query, []);

    res.render('admin/category/sub_category', {
      title: 'Sun Category',
      data: JSON.parse(results),
    });
  });
  //TO SHOW NANO CATEGORY FORM
  app.get('/nano_categories', async function(req, res, next) {
    var query = 'SELECT * FROM tbl_categories ORDER BY id DESC';
    results = await database.query(query, []);

    // render to views/user/list.ejs template file
    res.render('admin/category/nano_categories', {
      title: 'Nano Category',
      data: JSON.parse(results),
    });
  });

  /* to add new nano categories*/
  app.post('/add-nano-category', async function(req, res, next) {
    req.assert('name', 'Class Name is required').notEmpty();
    req.assert('sub_category_id', 'category id  is required').notEmpty(); //Validate class name
    var errors = req.validationErrors();
    if (!errors) {
      var name = req
        .sanitize('name')
        .escape()
        .trim();
      var category_id = req
        .sanitize('sub_category_id')
        .escape()
        .trim();
      var cl = {
        name: name,
        slug: str_replace(' ', '_', name),
        category_id: category_id,
      };

      var query =
        'INSERT INTO tbl_nano_category SET name = "' +
        cl.name +
        '" , slug = "' +
        cl.slug +
        '" , sub_category_id = "' +
        cl.category_id +
        '"';
      results = await database.query(query, [cl]);
      if (results) {
        req.flash('success', 'Nano Category Added Successfully!');
        res.redirect('/admin/category/nano_categories');
      } else {
        req.flash('error', 'Nano Category Addtion Failed!');
        res.redirect('admin/category/nano_categories');
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
      res.render('classes/addclass', {
        title: 'Add New Class',
        class_id: req.body.class_id,
        name: req.body.name,
      });
    }
  });
  // TO DELETE SUB CATEGORY
  app.get('/delete', async function(req, res, next) {
    var sbj = { id: req.params.id };

    var query = 'DELETE FROM tbl_sub_categories WHERE id = ' + req.query.id;
    results = await database.query(query, [sbj]);
    if (results) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      var obj = { success: 1, message: 'Sub Category Deleted successfully' };
      res.end(JSON.stringify(obj));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      var obj = { success: 0, message: 'Sub Category Not Deleted' };
      res.end(JSON.stringify(obj));
    }
  });

  // TO DELETE NANO CATEGORY
  app.get('/nanodelete', async function(req, res, next) {
    var sbj = { id: req.params.id };

    var query = 'DELETE FROM tbl_nano_category WHERE id = ' + req.query.id;
    results = await database.query(query, [sbj]);
    if (results) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      var obj = { success: 1, message: 'Nano Category Deleted successfully' };
      res.end(JSON.stringify(obj));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      var obj = { success: 0, message: 'Nano Category Not Deleted' };
      res.end(JSON.stringify(obj));
    }
  });

  return app;
};
