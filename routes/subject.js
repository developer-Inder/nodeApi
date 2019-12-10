var express = require('express')
var app = express()
const {database} = require('../utils/db.js')
module.exports = function ( passport) {

// SHOW LIST OF Subjects
app.get('/subject-list', async function(req, res, next) {
    
        var query = 'SELECT * FROM tbl_standards ORDER BY id ASC';
        results = await database.query(query, [] );
        res.render('admin/subjects/subjectlist', {
        title: 'Subject List',
        data: JSON.parse(results)
      })

})

// SHOW ADD SUBJECT FORM
app.get('/addsubject',async function(req, res, next){
  
      res.render('admin/subjects/addsubject', {
      title: 'Add Subject',
     
     })
         
})

app.get('/show_subject', async function(req, res, next) {
  
      var query = 'SELECT * FROM tbl_subjects';
       results = await database.query(query, [] );
          // res.writeHead(200, {'Content-Type': 'application/json'});
          res.send(results);
        
   
})








// ADD NEW Content POST ACTION
app.post('/addsubject',async function(req, res, next){
   
    req.assert('name', 'Subject Name is required').notEmpty()
   

    var errors = req.validationErrors()

    if( !errors ) {
        var sbj = {
            
            name: req.sanitize('name').escape().trim(),
            
        }

      
            var query = 'INSERT INTO tbl_subjects SET ?';
            console.log(query)
            results = await database.query(query, [sbj] );
                if (results) {
                    req.flash('success', 'Subject added successfully!')
                      res.redirect('/admin/subject/addsubject')
                   
                } else {
                    req.flash('error','Subject addition failed! ')
                     res.redirect('/admin/subject/addsubjects')
                }
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        res.redirect('/admin/subject/addsubject')
    }
})

// // SHOW EDIT USER FORM
// app.get('/editsubject/(:id)', function(req, res, next){
//     req.getConnection(function(error, conn) {
//         conn.query('SELECT * FROM subjects WHERE id = ' + req.params.id, function(err, rows, fields) {
//             if(err) throw err

//             // if class not found
//             if (rows.length <= 0) {
//                 req.flash('error', 'Subject not found with id = ' + req.params.id)
//                 res.redirect('/subject')
//             }
//             else { // if class found
//                 // render to views/classes/editclass.ejs template file
//                 res.render('subjects/editsubject', {
//                     title: 'Edit Subject',
//                     //data: rows[0],
//                     id: rows[0].id,
//                     subject_id:rows[0].subject_id,
//                     name: rows[0].name,
//                     })
//             }
//         })
//     })
// })

// EDIT classes POST ACTION
// app.put('/editsubject/:id', function(req, res, next) {
//     req.assert('subject_id','Subject Id is required').notEmpty()
//     req.assert('name','Subject Name is required').notEmpty()           //Validate name

//     var errors = req.validationErrors()

//     if( !errors ) {   //No errors were found.  Passed Validation!

//         /********************************************
//          * Express-validator module

//         req.body.comment = 'a <span>comment</span>';
//         req.body.username = '   a user    ';

//         req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
//         req.sanitize('username').trim(); // returns 'a user'
//         ********************************************/
//         var sbj = {
//             subject_id:req.sanitize('subject_id').escape().trim(),
//             name: req.sanitize('name').escape().trim(),
//             }

//         req.getConnection(function(error, conn) {
//             console.log(req.params);

//             conn.query('UPDATE subjects SET ? WHERE id = ' + req.params.id, sbj, function(err, result) {
//                 //if(err) throw err
//                 if (err) {
//                     req.flash('error', err)

//                     // render to views/user/add.ejs
//                     res.render('subject/editsubject', {
//                         title: 'Edit Subject',
//                         subject_id:req.body.subject_id,
//                         name: req.body.name,
//                         })
//                 } else {
//                     req.flash('success', 'Data updated successfully!')

//                     conn.query('SELECT * FROM subjects ORDER BY id DESC',function(err, rows, fields) {
//                         //if(err) throw err
//                         if (err) {
//                             req.flash('error', err)
//                             res.render('subjects/subjectlist', {
//                                 title: 'Subject List',
//                                 data: ''
//                             })
//                         } else {
//                             // render to views/user/list.ejs template file
//                             res.render('subjects/subjectlist', {
//                                 title: 'Subject List',
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
//         res.render('subjects/editsubject', {
//             title: 'Edit Subject',

//             subject_id:req.body.subject_id,
//             name: req.body.name,
//             })
//     }
// })

// DELETE Subject
app.get('/delete', async function(req, res, next) {
    var sbj = { id: req.params.id }

    
        var query = 'DELETE FROM tbl_subjects WHERE id = ' + req.query.id;
        results = await database.query(query, [sbj] );
            if (results) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                var obj = {success : 1 , message : 'Subject Deleted successfully'}
                  res.end(JSON.stringify(obj));
            } else {

                res.writeHead(200, {'Content-Type': 'application/json'});
                var obj = {success : 0 , message : 'Subject Not Deleted'}
                  res.end(JSON.stringify(obj));
            }
        
    
})
// app.get('/show_subjects', function(req, res, next) {
//     req.getConnection(function(error, conn) {
//       var query = 'SELECT * FROM tbl_subjects where class_id = '+req.query.id;
//         conn.query(query,function(err, rows, fields) {
//           res.writeHead(200, {'Content-Type': 'application/json'});
//             res.end(JSON.stringify(rows));
//         })
//     })
// })
return app

}
