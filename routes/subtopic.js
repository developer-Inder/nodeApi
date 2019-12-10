var express = require('express')
var app = express()
const {database} = require('../utils/db.js')
module.exports = function ( passport) {


// SHOW LIST OF BOARDS ON TOPIC LIST PAGE
app.get('/topic-list', async function(req, res, next ) {
    var query = 'select * from tbl_standards where id in (select class_id from tbl_subtopic) ORDER BY id ASC';
    results = await database.query(query, [] );
    //console.log(results)
    res.render('admin/subtopic/subtopic-list', {
        title: 'Topic List', 
        data: JSON.parse(results)
    })
    
    
})

 
// SHOW LIST OF CLASSES AND SUBJECTS ON ADD TOPIC PAGE
app.get('/addtopic', async function(req, res, next){
    var classes;
    var subjects;
    var query = 'SELECT * FROM tbl_standards ORDER BY id ASC';
     classes = await database.query(query, [] );
   var query = 'SELECT * FROM tbl_subjects ORDER BY id ASC';
    subjects = await database.query(query, [] );
    var data  = {
         classes :JSON.parse(classes),
         subjects : JSON.parse(subjects)
    }
    res.render('admin/subtopic/addsubtopic', {
        title: 'Topic List', 
        data: data
    })
  
  })


  
  
// SHOW LIST OF TOPICS WITH DESCRIPTION
  app.get('/show_topic', async function(req, res, next) {
      var query = 'SELECT * FROM tbl_subtopic where subject_id = ' + req.query.id + '&&class_id = ' + req.query.vid;
       results = await database.query(query, [] );
        // console.log(results)
          res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(results);
      
   
})

app.get('/show_subject',async function(req, res, next) {
    
    var query = 'SELECT tbl_subjects.*, tbl_subtopic.name FROM tbl_subjects LEFT JOIN tbl_subtopic ON tbl_subjects.id = tbl_subtopic.subject_id WHERE tbl_subtopic.class_id = '+ req.query.id + '  ';
   
       results = await database.query(query, [] );
        //res.writeHead(200, {'Content-Type': 'application/json'});
        res.send(results);
     
 
})






 
// ADD NEW Content POST ACTION
app.post('/addtopic', async function(req, res, next){    
 
    req.assert('name', 'Topic Name is required').notEmpty()  
    req.assert('text_name', 'Description is required').notEmpty()   

    var errors = req.validationErrors()
    
    if( !errors ) {  
        var fld = {
            topic_name: req.sanitize('name').escape().trim(),
            description: req.sanitize('text_name').escape().trim(),
            subject_id: req.sanitize('subject_id').escape().trim(),
            class_id:  req.sanitize('class_id').escape().trim(),
            
        }
        
            var query = 'INSERT INTO tbl_subtopic SET ?';
            results = await database.query(query, [fld] );
                if (results) {
                    req.flash('success', 'Topic added successfully!')
                    res.redirect('/admin/topic/addtopic') 
                        
                } else {                
                    req.flash('error', 'Topic Addition Failed')
                    res.redirect('/admin/topic/addtopic')   
                        
                }
           
       
           }
        else {   
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        res.redirect('/admin/topic/addtopic')
    }
})
 
// // SHOW EDIT USER FORM
// app.get('/editfield/(:id)', function(req, res, next){
//     req.getConnection(function(error, conn) {
//         conn.query('SELECT * FROM fields WHERE id = ' + req.params.id, function(err, rows, fields) {
//             if(err) throw err
            
//             // if class not found
//             if (rows.length <= 0) {
//                 req.flash('error', 'Field not found with id = ' + req.params.id)
//                 res.redirect('/fields')
//             }
//             else { // if class found
//                 // render to views/classes/editclass.ejs template file
//                 res.render('field/editfield', {
//                     title: 'Edit Field', 
//                     //data: rows[0],
//                     id: rows[0].id,
//                     field_name: rows[0].field_name,
//                     })
//             }            
//         })
//     })
// })
 
// // EDIT classes POST ACTION
// app.put('/editfield/:id', function(req, res, next) {
//     req.assert('field_name', 'Field Name is required').notEmpty()           //Validate name
    
//     var errors = req.validationErrors()
    
//     if( !errors ) {   //No errors were found.  Passed Validation!
        
//         /********************************************
//          * Express-validator module
         
//         req.body.comment = 'a <span>comment</span>';
//         req.body.username = '   a user    ';
 
//         req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
//         req.sanitize('username').trim(); // returns 'a user'
//         ********************************************/
//         var fld = {
//             field_name: req.sanitize('field_name').escape().trim(),
//             }
        
//         req.getConnection(function(error, conn) {
//             console.log(req.params);

//             conn.query('UPDATE fields SET ? WHERE id = ' + req.params.id, fld, function(err, result) {
//                 //if(err) throw err
//                 if (err) {
//                     req.flash('error', err)
                    
//                     // render to views/user/add.ejs
//                     res.render('field/editfield', {
//                         title: 'Edit Field',
//                         field_name: req.body.field_name,
//                         })
//                 } else {
//                     req.flash('success', 'Data updated successfully!')
                    
//                     conn.query('SELECT * FROM fields ORDER BY id DESC',function(err, rows, fields) {
//                         //if(err) throw err
//                         if (err) {
//                             req.flash('error', err)
//                             res.render('field/fieldlist', {
//                                 title: 'Field List', 
//                                 data: ''
//                             })
//                         } else {
//                             // render to views/user/list.ejs template file
//                             res.render('field/fieldlist', {
//                                 title: 'Field List', 
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
//         res.render('field/editfield', { 
//             title: 'Edit Field',            
            
//             field_name: req.body.field_name,
//             })
//     }
// })
 
// DELETE Class
app.get('/delete', async function(req, res, next) {
    var sbj = { id: req.params.id }

         var query = 'DELETE FROM tbl_subtopic WHERE id = ' + req.query.id; 
             results = await database.query(query, [sbj] );

            //if(err) throw err
            if (results) {
               // req.flash('success', 'User deleted successfully! id = ' + req.params.id)
                res.writeHead(200, {'Content-Type': 'application/json'});
                var obj = {success : 1 , message : 'Topic Deleted successfully'}
                  res.end(JSON.stringify(obj));
            } else {
              
                res.writeHead(200, {'Content-Type': 'application/json'});
                var obj = {success : 0 , message : 'Topic Not Deleted'}
                  res.end(JSON.stringify(obj));
               
            }
       
   
})
return app

}