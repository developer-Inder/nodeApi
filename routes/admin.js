var express = require('express');
var app = express();
// const config = require('../config/config');
// var str_replace = require('str_replace');
// session = require('express-session');
// app.use(session({
//     secret: '2C44-4D44-WppQ38S',
//     resave: true,
//     saveUninitialized: true
// }));

// var auth = function(req, res, next) {
//   //console.log(req.session)
//   if (req.session && req.session.user === "kush" && req.session.admin)
//     return next();
//   else
//       res.redirect('/admin/');
// };
// // Login endpoint
const auth = require('../utils/auth');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = function(passport) {
  //   app.get('/testCookie', (req,res)=>{
  //     res.cookie('email', "asdfsd@gmail.com")
  //     res.json(req.cookies)

  // })
  app.get('/getsubtopics');
  app.post('/login', passport.authenticate('local-login'), function(req, res) {
    var token = jwt.sign({ id: req.user.id, type: 'login' }, config.secret, {
      expiresIn: 86400, // expires in 24 hours
    });
    res.cookie('token', token);
    var ts = new Date().getTime();
    var response = { status: 'ok', token: token, ts: ts, message: 'success', user: req.user };
    res.json(response);
  });

  app.get('/checkStatus', (req, res) => {
    // console.log('cooooookieess', req.cookies);
    // console.log(req.window);
    token = req.headers.authorization ? req.headers.authorization : req.cookies.token ? req.cookies.token : null;
    if (
      token !== 'Bearer undefined' &&
      token !== 'undefined' &&
      token !== 'null' &&
      token !== 'false' &&
      token != null &&
      token
    ) {
      token = token.substring(7, token.length);

      // console.log('token is..' + token, typeof token);
      jwt.verify(token, config.secret, async function(err, decoded) {
        if (err) {
          // TODO : probably when jwt is expired jwt malformed error is given . chec kit out.
          console.log(err);

          res.json({ success: false, message: 'Failed to authenticate.' });
          return;
        } else {
          // console.log(decoded);
          // TODO : CHECK IF req.currentRoute is available to the decoded user if not send 404.
          var user = require('../models/user');
          // console.log(decoded);
          user = await user.findById(decoded.id);
          // console.log(user);
          req.currentUser = user;
          res.json({ success: true, token: token, message: 'success', user: user });
        }
      });
    } else {
      console.log('there..');
      res.json({ success: false, message: 'Failed to authenticate, No valid token.' });
    }
  });
  // Logout endpoint
  app.post('/logout', function(req, res) {
    console.log('logging oiut ...');
    req.session.destroy();
    res.cookie('token', '');
    res.json('message from upside');
  });
  return app;
};

// Get content endpoint
// app.get('/content', auth, function (req, res) {
//     res.send("You can only see this after you've logged in.");
// });
// app.get('/categories', auth, function(req, res, next){
//     req.getConnection(function(error, conn) {
//       conn.query('SELECT * FROM tbl_categories ORDER BY id DESC',function(err, rows, fields) {
//           if (err) {
//               req.flash('error', err)
//               res.render('admin/category/category_list', {
//                   title: 'Class List',
//                   data: ''
//               })
//           } else {
//               // render to views/user/list.ejs template file
//               res.render('admin/category/category_list', {
//                   title: 'Class List',
//                   data: rows
//               })
//           }
//       })
//   })

// })
// app.get('/remove_category/', auth, function(req, res, next){
//     req.getConnection(function(error, conn) {
//     conn.query('delete FROM tbl_categories where id = '+req.query.id,function(err, rows, fields) {
//       if (err) {
//           req.flash('error', err.sqlMessage)
//           res.redirect('../../admin/add-category');
//       } else {
//           req.flash('success', 'Category Deleted successfully!')
//           res.redirect('/admin/add-category');
//       }
//     })
// })

// })
// app.get('/add-category', auth, function(req, res, next){
//   req.getConnection(function(error, conn) {
//       conn.query('SELECT * FROM tbl_categories ORDER BY id DESC',function(err, rows, fields) {
//           if (err) {
//               req.flash('error', err)
//               res.render('admin/category/addcategory', {
//                   title: 'Class List',
//                   data: ''
//               })
//           } else {
//               // render to views/user/list.ejs template file
//               res.render('admin/category/addcategory', {
//                   title: 'Class List',
//                   data: rows
//               })
//           }
//       })
//   })

// })

// app.post('/add-category', auth, function(req, res, next){
//   req.assert('category_name','Class Name is required').notEmpty()         //Validate class name
//   var errors = req.validationErrors()
//   if( !errors ) {
//     var name = req.sanitize('category_name').escape().trim();
//     var cl = {
//         name: name,
//         slug: str_replace(' ' , '_' , name),
//         image:''
//       }
//       req.getConnection(function(error, conn) {
//           conn.query('INSERT INTO tbl_categories SET ?', cl, function(err, result) {
//               if (err) {
//                   req.flash('error', err)
//                   res.render('admin/category/addcategory', {
//                       title: 'Add New class',
//                       category_name: cl.category_name
//                   })
//               } else {
//                   req.flash('success', 'New Category added successfully!')
//                 res.redirect('/admin/add-category');
//               }
//           })
//       })
//   }
//   else {   //Display errors to user
//       var error_msg = ''
//       errors.forEach(function(error) {
//           error_msg += error.msg + '<br>'
//       })
//       req.flash('error', error_msg)

//       /**
//        * Using req.body.name
//        * because req.param('name') is deprecated
//        */
//       res.render('classes/addclass', {
//           title: 'Add New Class',
//           class_id: req.body.class_id,
//           name: req.body.name,
//       })
//   }

// })

// code  for content managment By Kush
// app.get('/content-list',  function(req, res, next){
//   req.getConnection(function(error, conn) {
//       conn.query('SELECT * FROM tbl_content ORDER BY id DESC',function(err, rows, fields) {
//           if (err) {
//               req.flash('error', err)
//               res.render('admin/content/content_list', {
//                   title: 'Class List',
//                   data: ''
//               })
//           } else {
//               // render to views/user/list.ejs template file
//               res.render('admin/content/content_list', {
//                   title: 'Class List',
//                   data: rows
//               })
//           }
//       })
//   })
// })
// /*to add post content */
// app.post('/add-content', function(req, res, next){

//   req.assert('title','title id is required').notEmpty()           //Validate id
//   req.assert('content','content is required').notEmpty()         //Validate class name
//   var errors = req.validationErrors()
//   var success,message;
//   var response = [];

//   // res.writeHead(200, {'Content-Type': 'application/json'});
//   // res.end(JSON.stringify(response));
//   if( !errors ) {
//     var content = {
//         title: req.sanitize('title').escape().trim(),
//         nano_category_id: req.sanitize('nano_category_id').escape().trim(),
//         description:req.sanitize('content'),
//         file:''
//     }
//     req.getConnection(function(error, conn) {
//       conn.query('INSERT INTO tbl_content SET ?', content, function(err, result) {
//         if (err) {
//           response = {
//             success :  0,
//             message:'error while inserting record'
//           }
//         }else{
//           response = {
//             success :  1,
//             message:'Content Added successfully'
//           }
//         }
//         res.writeHead(200, {'Content-Type': 'application/json'});
//         res.end(JSON.stringify(response));
//       })
//     })
//   }
//   else{
//       var error_msg = ''
//       errors.forEach(function(error) {
//           error_msg += error.msg + '<br>'
//       })
//       response = {
//         success :  0,
//         message:error_msg
//       }
//       res.writeHead(200, {'Content-Type': 'application/json'});
//       res.end(JSON.stringify(response));
//   }

// })

// app.get('/add-content', function(req, res, next){
//   req.getConnection(function(error, conn) {
//       conn.query('SELECT * FROM tbl_categories ORDER BY id DESC',function(err, rows, fields) {
//         if(rows){
//           res.render('admin/content/add-content', {
//               title: 'Class List',
//               data: rows
//           })
//         }else{
//           res.render('admin/content/add-content', {
//               title: 'Class List',
//               data: ''
//           })
//         }
//       })
//   })
// })
// function to add sub category
// app.get('/add_sub_category', function(req, res, next){
//   req.getConnection(function(error, conn) {
//       conn.query('SELECT id,name FROM tbl_categories ORDER BY id DESC',function(err, rows, fields) {
//           if (err) {
//               req.flash('error', err)
//               res.render('admin/category/sub_category', {
//                   title: 'Class List',
//                   data: ''
//               })
//           } else {
//               // render to views/user/list.ejs template file
//               res.render('admin/category/sub_category', {
//                   title: 'Class List',
//                   data: rows
//               })
//           }
//       })
//   })
// })
/*to get sub categories*/
// app.get('/get_subcategories/',  function(req, res, next){
//     req.getConnection(function(error, conn) {
//     conn.query('select id,name FROM tbl_sub_categories where category_id = '+req.query.id,function(err, rows, fields) {
//       res.writeHead(200, {'Content-Type': 'application/json'});
//         res.end(JSON.stringify(rows));
//     })
//   })
// })
// /*to get nano categories*/
// app.get('/get_nanocategories/',  function(req, res, next){
//     req.getConnection(function(error, conn) {
//     conn.query('select id,name FROM tbl_nano_category where sub_category_id = '+req.query.id,function(err, rows, fields) {
//       res.writeHead(200, {'Content-Type': 'application/json'});
//         res.end(JSON.stringify(rows));
//     })
//   })
// })
// /*to get contents*/
// app.get('/get_content/',  function(req, res, next){
//     req.getConnection(function(error, conn) {
//       var query ="SELECT tbl_content.id , tbl_content.type ,tbl_content.title ,tbl_content.description ,tbl_content.created_at , tbl_nano_category.name as nano_category ,tbl_sub_categories.name as sub_category ,tbl_categories.name as category from tbl_content INNER JOIN tbl_nano_category on tbl_content.nano_category_id = tbl_nano_category.id INNER JOIN tbl_sub_categories on tbl_nano_category.sub_category_id = tbl_sub_categories.id INNER JOIN tbl_categories on tbl_sub_categories.category_id = tbl_categories.id";
//     conn.query(query,function(err, rows, fields) {
//       res.writeHead(200, {'Content-Type': 'application/json'});
//         res.end(JSON.stringify(rows));
//     })
//   })
// })
// /* to add new sub categories*/
// app.post('/sub-category',  function(req, res, next){
//   req.assert('name','Class Name is required').notEmpty()
//   req.assert('category_id','category id  is required').notEmpty()     //Validate class name
//   var errors = req.validationErrors()
//   if( !errors ) {
//     var name = req.sanitize('name').escape().trim();
//     var category_id = req.sanitize('category_id').escape().trim();
//     var cl = {
//         name: name,
//         slug: str_replace(' ' , '_' , name),
//         category_id:category_id
//       }
//       req.getConnection(function(error, conn) {
//         var q = 'INSERT INTO tbl_sub_categories SET name = "'+cl.name+'" , slug = "'+cl.slug+'" , category_id = "'+cl.category_id+'"';
//           conn.query(q, function(err, result) {
//               if (err) {
//                   req.flash('error', err)
//                     res.redirect('/admin/add_sub_category');
//               } else {
//                   req.flash('success', 'New Category added successfully!')
//                   res.redirect('/admin/add_sub_category');
//               }
//           })
//       })
//   }
//   else {   //Display errors to user
//       var error_msg = ''
//       errors.forEach(function(error) {
//           error_msg += error.msg + '<br>'
//       })
//       req.flash('error', error_msg)

//       /**
//        * Using req.body.name
//        * because req.param('name') is deprecated
//        */
//       res.render('classes/addclass', {
//           title: 'Add New Class',
//           class_id: req.body.class_id,
//           name: req.body.name,
//       })
//   }

// })

// // function to add nano category
// app.get('/add_nano_category', function(req, res, next){
//   req.getConnection(function(error, conn) {
//       conn.query('SELECT id,name FROM tbl_categories ORDER BY id DESC',function(err, rows, fields) {
//         console.log(err)
//           if (err) {
//               req.flash('error', err)
//               res.render('admin/category/nano_categories', {
//                   title: 'Class List',
//                   data: ''
//               })
//           } else {
//               // render to views/user/list.ejs template file
//               res.render('admin/category/nano_categories', {
//                   title: 'Class List',
//                   data: rows
//               })
//           }
//       })
//   })
// })

// /* to add new nano categories*/
// app.post('/add-nano-category',  function(req, res, next){
//   req.assert('name','Class Name is required').notEmpty()
//   req.assert('sub_category_id','category id  is required').notEmpty()     //Validate class name
//   var errors = req.validationErrors()
//   if( !errors ) {
//     var name = req.sanitize('name').escape().trim();
//     var category_id = req.sanitize('sub_category_id').escape().trim();
//     var cl = {
//         name: name,
//         slug: str_replace(' ' , '_' , name),
//         category_id:category_id
//       }
//       req.getConnection(function(error, conn) {
//         var q = 'INSERT INTO tbl_nano_category SET name = "'+cl.name+'" , slug = "'+cl.slug+'" , sub_category_id = "'+cl.category_id+'"';
//           conn.query(q, function(err, result) {
//               if (err) {
//                   req.flash('error', err)
//                   console.log(err)
//                     res.redirect('/admin/add_nano_category');
//               } else {
//                   req.flash('success', 'New Category added successfully!')
//                   res.redirect('/admin/add_nano_category');
//               }
//           })
//       })
//   }
//   else {   //Display errors to user
//       var error_msg = ''
//       errors.forEach(function(error) {
//           error_msg += error.msg + '<br>'
//       })
//       req.flash('error', error_msg)

//       /**
//        * Using req.body.name
//        * because req.param('name') is deprecated
//        */
//       res.render('classes/addclass', {
//           title: 'Add New Class',
//           class_id: req.body.class_id,
//           name: req.body.name,
//       })
//   }

// })
