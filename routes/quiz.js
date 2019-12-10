var express = require('express');
var app = express();
session = require('express-session');
var url = require('url');
const { database } = require('../utils/db.js');
var queryfn = require('../utils/queryfn');
var colors = require('../utils/colors');
var utils = require('../utils/utils');
var es = require('../utils/es/es');
var indices = require('../utils/es/indices');
var eshelpers = require('../utils/es/helpers');
var crypto = require('crypto');
module.exports = function(passport) {
  app.get('/', async function(req, res, next) {
    var data = 'done';
    res.json({ data });
  });
  app.get('/users', async function(req, res, next) {
    // console.log(req.query.first_name)
    var users = await database.query('select id,first_name from tbl_user where id = ? ', [req.query.uid]);
    if (users.length) {
      users = JSON.parse(users);
    } else {
      users = 'User not found';
    }
    res.json({ users });
  });
  app.get('/boards', async function(req, res, next) {
    // console.log(req.query.first_name)
    var users = await database.query('SELECT id as board_id,name as board_name FROM `tbl_boards`');
    boards = JSON.parse(users);
    res.json({ boards });
  });
  app.get('/classes', async function(req, res, next) {
    // console.log(req.query.first_name)
    var classes = await database.query('SELECT name as class_name,id as class_id FROM `tbl_standards`');
    classes = JSON.parse(classes);
    res.json({ classes });
  });
  app.get('/subjects', async function(req, res, next) {
    // console.log(req.query.first_name)
    var subjects = await database.query('SELECT name as subject_name,id as subject_id FROM `tbl_subjects`');
    subjects = JSON.parse(subjects);
    res.json({ subjects });
  });
  app.get('/topics', async function(req, res, next) {
    var topics = await database.query(
      'SELECT id as topic_id,name as topic_name,description FROM `tbl_topic` where subject_id = ? && class_id = ?',
      [req.query.subject_id, req.query.class_id]
    );
    topics = JSON.parse(topics);
    // var topicss = []
    // topicss.push(topics)
    var topic = { topics: topics };
    res.json(topic);
  });

  app.get('/insertQuestionDetail', async function(req, res, next) {
    var question = await database.query('INSERT into question_detail (`question_id`,`topic_id`) VALUE (?,?)', [
      questionid,
      topic_id,
    ]);
    var response;
    response = 'Done';
    res.json({ response });
  });
  app.post('/update_profile', async function(req, res, next) {
    var question = await database.query('UPDATE `tbl_user` SET `board`=?,`subject`=?,`standard`=? where id = ?', [
      req.body.board,
      req.body.subject,
      req.body.standard,
      req.body.logged_id,
    ]);
    var response = question.affectedRows;
    if (response == 1) {
      var response = { message: 'Board updated.' };
    } else {
      var response = { message: 'Something went wrong..' };
    }
    res.json({ response });
  });
  app.get('/questions', async function(req, res, next) {
    var finallimit = req.query.limit;
    var li = finallimit >= 100 ? 100 : finallimit;
    var li_f = parseInt(li);
    var question = await database.query(
      'SELECT question_id,id FROM question_detail where topic_id = ? ORDER BY RAND() LIMIT ?',
      [req.query.topic_id, li_f]
    );
    questions = JSON.parse(question);
    var questionArray = [];
    questions.forEach(question => {
      questionArray.push(question.question_id);
    });
    var question1 = await database.query(
      'Select id as question_id, md5(CONCAT(id,NOW())) as ids,topic_id,question,ans_1,ans_2,ans_3,ans_4,created_at,correct_ans,explanation from quiz_question_answers where id in (?)',
      [questionArray]
    );
    questionArray_ = JSON.parse(question1);
    var question_id_array = [];
    var question_id_encrypt = [];
    var topic_ids;
    var finalArray_ = [];
    var ans_array = [];
    var explanations = [];
    questionArray_.forEach(question_idd => {
      question_id_array.push(question_idd.question_id);
      question_id_encrypt.push(question_idd.ids);
      topic_ids = question_idd.topic_id;
      explanations.push(question_idd.explanation);
      var question_string = question_idd.question;
      ans_array.push(question_idd.correct_ans);
      var final_sta = {
        question_token: question_idd.ids,
        question_string: question_string,
        ans_1: question_idd.ans_1,
        ans_2: question_idd.ans_2,
        ans_3: question_idd.ans_3,
        ans_4: question_idd.ans_4,
      };
      finalArray_.push(final_sta);
    });
    var ansData = ans_array.join(',');
    var ans_array_to_string = ansData;
    var explanations_string = explanations.join(',');
    var finaldata = question_id_array.join(',');
    var lastdata = finaldata;
    var geten = question_id_encrypt.join(',');
    var lastdata1 = geten;
    var logged_id = 'admin';
    var result = await database.query(
      'INSERT INTO `active_quizzes`(`user_id`, `topic_id`,`questions`,`encrypt_question`,`encrypt_answer`,`total_question`,`explanations`) VALUE (?,?,?,?,?,?,?)',
      [logged_id, topic_ids, lastdata, lastdata1, ans_array_to_string, li_f, explanations_string]
    );
    var last_token = Object.values(result)[2];
    var data = { questions: finalArray_, token_is: last_token };
    res.json(data);
  });
  app.post('/submitQuestionAnswer', async function(req, res, next) {
    // console.log(req.body);
    var token = req.body.token_is;
    var answer = req.body.answer_array;
    // var answer = ['ans_1', undefined, 'ans_1'];
    var results = await database.query(
      'Select user_id,encrypt_answer,explanations,total_question from active_quizzes where id = ?',
      [token],
      1
    );
    var answer_array = JSON.parse(results);
    var ans_array;
    ans_array = answer_array.encrypt_answer.split(',');
    var explanations_array = answer_array.explanations.split(',');
    // var answer = answer.split(',')
    var right = [];
    var wrong = [];
    for (i = 0; i < answer_array.total_question; i++) {
      // if (ans_array[i] == ans_array[i]) {
      if (answer[i] == ans_array[i]) {
        right.push(i);
      } else {
        wrong.push(i);
      }
    }
    right_ans = right.length;
    wrong_ans = wrong.length;
    var attemp = '1';
    await database.query(
      'UPDATE `active_quizzes` SET `attemped_question`=?,`right_answer` = ?,`wrong_answer` = ?  where id = ?',
      [attemp, right_ans, wrong_ans, token]
    );
    // explanations = ["explantion1", "explantion1","explantion1","explantion1","explantion1","explantion1","explantion1","explantion1","explantion9","explantion10",]
    var response = { correctAnswers: ans_array, score: right_ans, explanations: explanations_array };
    res.json(response);
  });

  app.get('/getQuestionAnswer', async function(req, res, next) {
    res.json({ data });
  });

  return app;
};
