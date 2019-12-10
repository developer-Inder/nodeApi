var express = require('express')
var app = express()
const { database } = require('../utils/db.js')
var path = require('path')
//var formidable = require('formidable');
var fileUpload = require('express-fileupload') 
const fs = require('fs-extra')
var utils = require('../utils/utils')
var path=require('path')
var mkdirp = require('mkdirp');

// SHOW LIST OF classes
module.exports = function ( passport) {

  app.get('/contentlist', async function (req, res, next) {

    var query = 'select * from tbl_standards where id in (select class_id from tbl_topic) ORDER BY id ASC';
    results = await database.query(query, []);
    var content = database.query('select * from tbl_content where 1', [])
    res.render('admin/content/contentlist', {
      title: 'Add content',
      data: JSON.parse(results),
      content: JSON.parse(content)
    })

  })

  app.get('/showfile', async function (req, res, next) {
    var query = 'SELECT * FROM tbl_contents where file_type = "0" and topic_id = ' + req.query.id;
    results = await database.query(query, []);
    // res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);


  })
  app.get('/showpdf', async function (req, res, next) {
    var query = 'SELECT * FROM tbl_contents where file_type = "1" and topic_id = ' + req.query.id;
    results = await database.query(query, []);
    // res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);


  })





  app.get('/addcontent', async function (req, res, next) {

    var selectclass;
    var boards;
    var query = 'select * from tbl_standards where id in (select class_id from tbl_topic) ORDER BY id ASC';
    selectclass = await database.query(query, []);
    var query = 'select * from tbl_boards ORDER BY id ASC';
    var subjects = await database.query('select * from tbl_subjects', [])
    boards = await database.query(query, []);
    subjects = JSON.parse(subjects)
    // console.log(subjects)
    var data = {

      selectclass: JSON.parse(selectclass),
      boards: JSON.parse(boards),
      subjects: subjects


    }


    res.render('admin/content/addcontent', {
      title: 'Add Subject',
      data: data
    })
  })

  app.get('/show_subject', async function (req, res, next) {
    console.log(req.query)
    //var query = 'SELECT tbl_subjects.*, tbl_topic.topic_name FROM tbl_subjects LEFT JOIN tbl_topic ON tbl_subjects.id = tbl_topic.subject_id WHERE tbl_topic.class_id = ' + req.query.id + '  ';
    //console.log(query);
    var query = 'select * from tbl_subjects'
    results = await database.query(query, []);
    //res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);


  })
  // SHOW LIST OF TOPICS WITH DESCRIPTION
  app.get('/show_topic_name', async function (req, res, next) {
    var query = 'SELECT * FROM tbl_topic where subject_id = ' + req.query.id + '&&class_id = ' + req.query.vid;
    results = await database.query(query, []);
    console.log(results)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(results);
  })
  // ADD NEW Content POST ACTION
  /*
  * GET home page.
  */


  const multer = require('multer');

  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log(req.body)
     
      var result = utils.createDir(location)
      if (result) file.location = location
      console.log("uploading..")
      cb(null, location)
     
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })

  var upload = multer({ storage: storage, preservePath: true })
  app.get('/ut', async (req, res, next) => {
    res.render('admin/content/uploadtest')

  })

  app.post('/uploadtest', upload.single('myFiles', 1), async (req, res, next) => {
    console.log(req.files)
 //   res.send("<a href=" + express.static(path.join(__dirname, req.files[0].path)) + ".png" + ">click here </a>")
    //   if(!req.file) {
    //     console.log("not uploading")
    //     res.render('admin/content/uploadtest')
    //   } 
    //   else{
    // console.log("uploading")
         var pdf = req.files.myFiles;
         var board = req.body.board_id || '7'
         var cls = req.body.class_id ||'7'
         var subject = req.body.subject_id ||'7'
         var type = pdf.mimetype ||'img/jpg'
         type = type.substring(type.indexOf("/") + 1);

         var location = 'assets/uploads/' + board + '/' + cls + '/' + subject + '/' + type
         var mkdirp = require('mkdirp');
    
         mkdirp(location, function (err) {
             if (err) console.error(err)
             else {
              pdf.mv(location + req.files.myFiles.name, async function (success, err) {
                console.log("in process")
                console.log(success)
                console.log(err)
              })
             }
         });
         
    //   }

  })
  
  app.post('/addcontent', upload.array('cFiles', 2), async function (req, res, next) {

    message = '';
    var post = req.body;
    var cls = post.class_id;
    var board = post.board_id;
    var subject = post.subject_id;
    var topic = post.topic_id;
    var content_title = post.content_title;
    var content_desc = post.content_desc
    var content = post.content
    var subtopic_id = post.subtopic_id
    const files = req.files;
    var pdf, flipbook = ""
    files.forEach((v, i, arr) => {
      console.log(v)
      if (v.mimetype == "application/pdf") {
        pdf = v.filename + ".pdf"
      }
      if (v.mimetype == "application/zip") {
        flipbook = v.filename + ".zip"
      }

    })
    var query = "INSERT INTO `tbl_contents`(`board_id`,`class_id`,`subject_id`,`topic_id`,`content_title`,`content_desc`, `subtopic_id`,`flipbook`,`pdf`,`content`) VALUES (?,?,?,?,?,?,?,?,?,?)"
    var results = database.query(query, [board, cls, subject, topic, content_title, content_desc, subtopic_id, flipbook, pdf, content])
    if (results) {
      req.flash('success', "Added Successfully!")
      res.redirect('/admin/content/addcontent')
    }
    else {
      req.flash('error', err)
      res.redirect('/admin/content/addcontent')
    }

    // var pdf = req.files.pdf;
    // // console.log(file);
    // if (pdf) {
    //   var img_name = (new Date().getTime());
    //   //console.log(img_name)
    //   if (pdf.mimetype == "image/jpeg" || pdf.mimetype == "image/png" || pdf.mimetype == "image/gif" || pdf.mimetype == "application/pdf") {

    //     pdf.mv('assets/uploads/pdf/' + img_name, async function (err) {


    //       var query = "INSERT INTO `tbl_contents`(`board_id`,`class_id`,`subject_id`,`topic_id`,`content_title`,`content_desc`, `subtopic_id`,`file`) VALUES ('" + board + "','" + cls + "','" + subject + "','" + topic + "','" + my_title + "','" + content_wise + "','" + subtopic_id + "','" + img_name + "')";
    //       console.log(query);
    //       results = await database.query(query, []);
    //       if (results) {


    //         var flipbook = req.files.zip;
    //         // console.log(file);
    //         if (flipbook) {
    //           var img_name = (new Date().getTime());
    //           //console.log(img_name)
    //           if (flipbook.mimetype == "image/jpeg" || flipbook.mimetype == "image/png" || flipbook.mimetype == "image/gif" || flipbook.mimetype == "application/pdf") {

    //             flipbook.mv('assets/uploads/flipbook/' + img_name, async function (err) {
    //               var query = "INSERT INTO `tbl_contents`(`board_id`,`class_id`,`subject_id`,`topic_id`,`content_title`,`content_desc`, `subtopic_id`,`file`) VALUES ('" + board + "','" + cls + "','" + subject + "','" + topic + "','" + my_title + "','" + content_wise +"','" +subtopic_id +  "','" + img_name + "')";
    //               console.log(query);
    //               results = await database.query(query, []);
    //               if (results) {
    //                 results.push("flipbook");
    //               } else {

    //                 req.flash('error', err)
    //                 res.redirect('/admin/content/addcontent')
    //               }

    //             });
    //             req.flash('success', 'Content added successfully!')
    //             res.redirect('/admin/content/addcontent')
    //           } else {

    //             req.flash('error', err)
    //             res.redirect('/admin/content/addcontent')
    //           }
    //         }
    //       }
    //     });
    //   } else {
    //     req.flash('error', "This format is not allowed , please upload file with '.png','.gif','.jpg','.pdf'")
    //     res.redirect('/admin/content/addcontent')
    //   }
    // } else {

    //   var query = "INSERT INTO `tbl_contents`(`board_id`,`class_id`,`subject_id`,`topic_id`,`content_title`,`content_desc`, `subtopic_id`) VALUES ('" + board + "','" + cls + "','" + subject + "','" + topic + "','" + my_title + "','" + content_wise + "','" + subtopic_id+"')";
    //   console.log(query);
    //   results = await database.query(query, []);
    //   if (results) {
    //     req.flash('success', 'Content added successfully! No files were uploaded')
    //     res.redirect('/admin/content/addcontent')
    //   } else {

    //     req.flash('error', err)
    //     res.redirect('/admin/content/addcontent')
    //   }




    // }

  });
  //TO GRT SUBJECT LIST
  app.get('/show_subject', async function (req, res, next) {
    name
    var query = 'SELECT tbl_subjects.*, tbl_topic.name FROM tbl_subjects LEFT JOIN tbl_topic ON tbl_subjects.id = tbl_topic.subject_id WHERE tbl_topic.class_id = ' + req.query.id + '  ';

    results = await database.query(query, []);
    //res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);


  })
  app.post('/get_topics', async function (req, res, next) {
    var d = req.body;
    console.log(d)
    var cl = d.cl;
    var sb = d.sb;
    var brd = d.brd;

    var query = 'SELECT * from tbl_topic where class_id=? and subject_id=? and board_id=?';

    results = await database.query(query, [cl, sb, brd]);
    //res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);
  })
  app.post('/get_sub_topics', async function (req, res, next) {
    var d = req.body;
    console.log(d)
    var cl = d.cl;
    var sb = d.sb;
    var brd = d.brd;
    var tpc = d.tpc
    var query = 'SELECT * from tbl_subtopic where class_id=? and subject_id=? and board_id=? and topic_id=?';
    console.log(query)
    results = await database.query(query, [cl, sb, brd, tpc]);
    //res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);
  })
  // SHOW LIST OF TOPICS
  //   app.get('/show_topic', async function(req, res, next) {
  //       var query = 'SELECT * FROM tbl_topic where subject_id = ' + req.query.id;
  //        results = await database.query(query, [] );
  //         // console.log(results)
  //           res.writeHead(200, {'Content-Type': 'application/json'});
  //             res.end(results);


  // })

  // SHOW EDIT USER FORM
  // app.get('/editcontent/(:id)', function(req, res, next){
  //     req.getConnection(function(error, conn) {
  //         conn.query('SELECT * FROM content WHERE id = ' + req.params.id, function(err, rows, fields) {
  //             if(err) throw err

  //             // if class not found
  //             if (rows.length <= 0) {
  //                 req.flash('error', 'Content not found with id = ' + req.params.id)
  //                 res.redirect('/contents')
  //             }
  //             else { // if class found
  //                 // render to views/classes/editclass.ejs template file
  //                 res.render('content/editcontent', {
  //                     title: 'Edit Content', 
  //                     //data: rows[0],
  //                     id: rows[0].id,
  //                     pdf_link: rows[0].pdf_link,
  //                     heading: rows[0].heading,
  //                     content:rows[0].content,
  //                     flipbook: rows[0].flipbook,
  //                     keywords: rows[0].keywords,
  //                     tags: rows[0].tags,
  //                     owner: rows[0].owner,                    
  //                 })
  //             }            
  //         })
  //     })
  // })

  // EDIT classes POST ACTION
  // app.put('/editcontent/:id', function(req, res, next) {
  //     req.assert('pdf_link', 'PDF-Link is required').notEmpty()           //Validate name
  //     req.assert('heading', 'Heading is required').notEmpty()
  //     req.assert('content', 'Content is required').notEmpty()
  //     req.assert('flipbook','flipbook is required').notEmpty()
  //     req.assert('keywords','Keywords are required').notEmpty()
  //     req.assert('tags', 'Tags are required').notEmpty()
  //     req.assert('owner', 'Owner is required').notEmpty()

  //     var errors = req.validationErrors()

  //     if( !errors ) {   //No errors were found.  Passed Validation!

  //         /********************************************
  //          * Express-validator module

  //         req.body.comment = 'a <span>comment</span>';
  //         req.body.username = '   a user    ';

  //         req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
  //         req.sanitize('username').trim(); // returns 'a user'
  //         ********************************************/
  //         var cont = {
  //             pdf_link: req.sanitize('pdf_link').escape().trim(),
  //             heading: req.sanitize('heading').escape().trim(),
  //             content: req.sanitize('content').escape().trim(),
  //             flipbook: req.sanitize('flipbook').escape().trim(),
  //             keywords: req.sanitize('keywords').escape().trim(),
  //             tags: req.sanitize('tags').escape().trim(),
  //             owner: req.sanitize('owner').escape().trim(),


  //         }

  //         req.getConnection(function(error, conn) {
  //             console.log(req.params);

  //             conn.query('UPDATE content SET ? WHERE id = ' + req.params.id, cont, function(err, result) {
  //                 //if(err) throw err
  //                 if (err) {
  //                     req.flash('error', err)

  //                     // render to views/user/add.ejs
  //                     res.render('content/editcontent', {
  //                         title: 'Edit Content',
  //                         pdf_link: req.body.pdf_link,
  //                         heading: req.body.heading,
  //                         content:req.body.content,
  //                         flipbook: req.body.flipbook,
  //                         keywords: req.body.keywords,
  //                         tags: req.body.tags,
  //                         owner: req.body.owner,
  //                     })
  //                 } else {
  //                     req.flash('success', 'Data updated successfully!')

  //                     conn.query('SELECT * FROM content ORDER BY id DESC',function(err, rows, fields) {
  //                         //if(err) throw err
  //                         if (err) {
  //                             req.flash('error', err)
  //                             res.render('content/contentlist', {
  //                                 title: 'Content List', 
  //                                 data: ''
  //                             })
  //                         } else {
  //                             // render to views/user/list.ejs template file
  //                             res.render('content/contentlist', {
  //                                 title: 'Content List', 
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
  //         res.render('content/editcontent', { 
  //             title: 'Edit Content',            

  //             pdf_link: req.body.pdf_link,
  //             heading: req.body.heading,
  //             content:req.body.content,
  //             flipbook: req.body.flipbook,
  //             keywords: req.body.keywords,
  //             tags: req.body.tags,
  //             owner: req.body.owner,
  //         })

  //     }
  // })



  // DELETE Class
  app.get('/delete', async function (req, res, next) {
    var sbj = { id: req.params.id }


    var query = 'DELETE FROM  tbl_contents WHERE id = ' + req.query.id;
    results = await database.query(query, [sbj]);
    if (results) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      var obj = { success: 1, message: 'Content Deleted successfully' }
      res.end(JSON.stringify(obj));
    } else {

      res.writeHead(200, { 'Content-Type': 'application/json' });
      var obj = { success: 0, message: 'Content Not Deleted' }
      res.end(JSON.stringify(obj));
    }
  })
return app
}