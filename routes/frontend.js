var express = require('express');
var app = express();
session = require('express-session');
// var url = require('url');
const { database } = require('../utils/db.js');
// var queryfn = require('../utils/queryfn');
// var colors = require('../utils/colors');
var utils = require('../utils/utils');
var es = require('../utils/es/es');
// var indices = require('../utils/es/indices');
// var eshelpers = require('../utils/es/helpers');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { check, validationResult } = require('express-validator');

module.exports = function (passport) {
  app.get('/get_items', async function (req, res, next) {
    console.log('logging items.....', req.query);
    //  utils.store_selected_item(req.user,req.query.key,req.query.item_id);
    console.log('logging cookies after clearing', req.cookies);

    if (typeof d == 'undefined') {
      console.log('d is undefined...');
      d = {};
    }
    console.log('logging d after clearing', d);
    d[req.query.key] = req.query.item_id;
    console.log('hello...', d);
    // var n = req.cookies.default_items || d
    var result = await utils.get_selected_item_children(req.query.key, req.query.item_id, d);
    // result={}

    console.log('the actual d is now...', d);

    res.cookie('default_items', d);
    res.json({ status: 'ok', items: result.result, selected_key: result.key, cookies: d });
  });

  app.get('/get_test_items', async function (req, res, next) {
    console.log('logging items.....', req.query);
    //  utils.store_selected_item(req.user,req.query.key,req.query.item_id);
    console.log('logging cookies after clearing', req.cookies);

    if (typeof d_tests == 'undefined') {
      console.log('d is undefined...');
      d_tests = {};
    }
    console.log('logging d after clearing', d_tests);
    d_tests[req.query.key] = req.query.item_id;
    console.log('hello...', d_tests);
    // var n = req.cookies.default_items || d
    var result = await utils.get_test_children(req.query.key, req.query.item_id, d_tests);
    // result={}

    console.log('the actual d is now...', d_tests);

    res.cookie('default_test_items', d_tests);
    res.json({ status: 'ok', items: result.result, selected_key: result.key, cookies: d_tests });
  });
  app.post('/login', passport.authenticate('local-login'), function (req, res) {
    var token = jwt.sign({ id: req.user.id, type: 'login' }, config.secret, {
      expiresIn: 86400, // expires in 24 hours
    });
    res.cookie('token', token);
    var ts = new Date().getTime();
    var response = { status: 'ok', token: token, ts: ts, message: 'success', user: req.user };
    res.json(response);
  });

  app.get('/get_lesson', async (req, res) => {
    var cookies = req.cookies;
    console.log(req.query);
    var slug = req.query.slug;
    var id = req.query.id;
    var relatedTopics = await findRelatedTopics(id, cookies);
    var relatedParentTopics = await findRelatedParentTopics(id, cookies);
    var activeLesson = await findActiveLesson(id);

    var data = { activeLesson, relatedTopics, relatedParentTopics };

    res.json(data);
  });
  app.get('/reset_prefs', (req, res) => {
    console.log('api called', req.cookies);
    res.clearCookie('default_items', { boards: '', standards: '', subjects: '' });
    d = {};
    res.json({ message: 'success', cookies: req.cookies });
  });
  app.get('/reset_test_prefs', (req, res) => {
    console.log('api called', req.cookies);
    res.clearCookie('default_test_items', { subjects: '', standards: '' });
    d_tests = {};
    res.json({ message: 'success', cookies: req.cookies });
  });
  // app.get('/career/paths', async function(req, res, next) {
  //   // console.log(req.query.first_name)
  //   var careers = await database.query('select id,pathName from career_paths');
  //   res.json(JSON.parse(careers));
  // });
  app.get('/career/details', async function (req, res, next) {
    console.log(req.query.id);
    var careers = await database.query('select * from career where id= ?', [req.query.id]);
    res.json(JSON.parse(careers));
  });
  app.get('/career/paths', async function (req, res, next) {
    var career_paths = await database.query('SELECT * FROM `career_paths`');
    career_pathss = JSON.parse(career_paths);
    res.json(career_pathss)
    // var careersD_ = [];
    // var qu_ids = [];
    // career_pathss.forEach(element => {
    //   qu_ids.push(element.path_id);
    //   careersD_.push(element.pathName);
    // });
    // var queryData = await utils.getcareerData(qu_ids, careersD_);
    // res.json(queryData);
  });
  app.post('/career/singlePath/', async function (req, res, next) {
    console.log(req.body)
    var career_paths = await database.query('SELECT * FROM career where parent=?', [req.body.pathId]);
    career_pathss = !career_paths.length ? [] : JSON.parse(career_paths);

    utils.respond(career_pathss, res)
    // var careersD_ = [];
    // var qu_ids = [];
    // career_pathss.forEach(element => {
    //   qu_ids.push(element.path_id);
    //   careersD_.push(element.pathName);
    // });
    // var queryData = await utils.getcareerData(qu_ids, careersD_);
    // res.json(queryData);
  });

  app.post('/blog/create', async function (req, res, next) {
    req.assert('title', 'Title is required').notEmpty();
    req.assert('title', 'Title minimum length is 20').isLength(5, 10000);
    req.assert('content', 'Content is required').notEmpty(); //Validate class name
    req.assert('user_id', 'UserId is required').notEmpty();

    var errors = req.validationErrors();

    if (!errors) {
      var submitBlog = await database.query('INSERT INTO `blog_post`(`title`, `content`,`user_id`) VALUES (?,?,?)', [
        req.body.title,
        req.body.content,
        req.body.user_id,
      ]);
      if (submitBlog) {
        var response = { status: 200, message: 'success' };
      } else {
        var response = { status: 403, message: 'Something went wrong' };
      }
    } else {
      var response = { status: 403, message: errors[0].msg, details: errors };
    }
    res.json(response);
  });
  app.post('/blog/newComment', async function (req, res, next) {
    if (req.body.parent) {
      var submitBlog = await database.query('INSERT INTO `comments`(`authorId`, `authorName`, `body`, `parent`, `blogId`) VALUES (?,?,?,?,?)', [req.body.authorId, req.body.authorName, req.body.body, req.body.parent, req.body.blogId]);
      var lastInsertId = submitBlog.insertId
      var getChildren = await database.query('Select children from comments where id = ?', [req.body.parent]);
      var getChildren = JSON.parse(getChildren);
      if ((getChildren[0].children)) {
        var update_Children = getChildren[0].children + ',' + lastInsertId
      } else {
        var update_Children = lastInsertId
      }
      var updateComment = await database.query('UPDATE `comments` SET `children`= ? where id = ?', [update_Children, req.body.parent]);
    } else {
      var newComment = await database.query('INSERT INTO `comments`(`authorId`, `authorName`, `body`, `parent`, `blogId`) VALUES (?,?,?,?,?)', [req.body.authorId, req.body.authorName, req.body.body, req.body.parent, req.body.blogId]);
      var lastInsertId = newComment.insertId
      var getComment = await database.query('Select comments from blog_post where id = ?', [req.body.blogId]);
      var getcomments = JSON.parse(getComment);
      if ((getcomments[0].comments)) {
        var update_Comment = getcomments[0].comments + ',' + lastInsertId
      } else {
        var update_Comment = lastInsertId
      }
      var updateComment = await database.query('UPDATE `blog_post` SET `comments`= ? where id = ?', [update_Comment, req.body.blogId]);

    }
    if (updateComment) {
      response = { status: true, message: 'success' }
    } else {
      response = { status: false, message: 'Comment could not be added to the database.' }
    }
    res.json(response)
  });
  app.post('/blog/comment', async function (req, res, next) {
    var getComment = await database.query('Select comments from blog_post where id = ?', [req.body.blogId]);
    var getcomments = JSON.parse(getComment);
    console.log(typeof getcomments[0].comments);

    if ((getcomments[0].comments)) {
      var update_Comment = getcomments[0].comments + ',' + req.body.comment
    } else {
      var update_Comment = req.body.comment
    }
    var updateComment = await database.query('UPDATE `blog_post` SET `comments`= ?,`parent` = ? where id = ?', [update_Comment, req.body.parent_id, req.body.blogId]);
    var updateChildren = await database.query('UPDATE `blog_post` SET `children` = ? where id = ?', [req.body.parent_id, req.body.blogId]);
    if (updateComment && updateChildren) {
      response = { status: 200, message: 'success' }
    } else {
      response = { status: 403, message: 'error' }
    }
    res.json(response);
  });
  app.get('/blogs/show', async function (req, res, next) {
    var career_paths = await database.query('SELECT * FROM `blog_post` where status = 0');
    career_pathss = JSON.parse(career_paths);
    res.json(career_pathss);
  });
  app.post('/blog/show', async function (req, res, next) {
    var career_paths = await database.query('SELECT * FROM `blog_post` where id = ?', [req.body.blogId]);
    var rootComments = await database.query('SELECT * FROM `comments` where blogId = ? and parent is null', [req.body.blogId]);
    career_pathss = JSON.parse(career_paths);
    rootComments = JSON.parse(rootComments);
    response = { blog: career_pathss[0], comments: rootComments }
    res.json(response);
  });
  app.post('/blog/commentClick', async function (req, res, next) {
    var childId = await database.query('SELECT children FROM `comments` where id = ?', [req.body.id]);
    childId = JSON.parse(childId);
    if (childId[0]) {
      // console.log(childId[0].children);
      var comment = await database.query(`SELECT * FROM comments where id in (${[childId[0].children]})`);
      comment = JSON.parse(comment);
    } else {
      comment = null
    }
    // console.log(comment);
    res.json(comment);
  });
  app.post('/blog/parentCommentId', async function (req, res, next) {
    var childId = await database.query('SELECT parent FROM `comments` where id = ?', [req.body.id]).catch(err => console.log(err));
    childId = JSON.parse(childId);
    res.json(childId[0]);
  });
  app.post('/logout', function (req, res) {
    console.log('logging oiut ...');
    req.session.destroy();
    res.cookie('token', '');
    res.json('message from upside');
  });
  app.get('/user', async function (req, res, next) {
    //  res.render('atest/test')
    var index = req.body.indexName;
    var jsonFile = req.query.bulkFileName;

    var a = await es.addBulk('cities');
    console.log(a);
    res.end('added successfully');
  });
  return app;
};
