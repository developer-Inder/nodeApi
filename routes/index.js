var express = require('express');
var app = express();
var url = require('url');
const { database } = require('../utils/db.js');
var queryfn = require('../utils/queryfn');
var colors = require('../utils/colors');
var utils = require('../utils/utils');
var es = require('../utils/es/es');

module.exports = function(passport) {
  app.get('/', async function(req, res, next) {
    console.log(colors.reverse, 'Hello world');

    var subjects;
    var classes;
    var boards;
    var entranc;
    var query = 'SELECT * FROM tbl_exam_type ORDER BY id ASC';
    entranc = await database.query(query, []);
    var query = 'SELECT * FROM tbl_subjects  ORDER BY id ASC';
    subjects = await database.query(query, []);
    var query = 'SELECT * FROM tbl_standards  ORDER BY id ASC';
    classes = await database.query(query, []);
    var query = 'SELECT * FROM tbl_boards ORDER BY id ASC';
    boards = await database.query(query, []);

    var data = {
      entranc: JSON.parse(entranc),
      boards: JSON.parse(boards),
      classes: JSON.parse(classes),
      subjects: JSON.parse(subjects),
    };
    // console.log(data)

    res.render('site/index', {
      title: 'Add content',
      data: data,
    });
  });

  app.get('/dashboard', async function(req, res, next) {
    var task = req.query.task;
    var subtask = req.query.subtask;
    res.status(200).json({ task: parseInt(task), subtask: parseInt(subtask) + 1 });
  });
  app.get('/eltest', async (req, res) => {
    var json = { id: 'hello world', name: 'ramesh2' };
    result = await es.addToIndex('test', json);
    res.json(result);
  });
  //file:///home/ramesh/Downloads/Slicing/New%20folder/drawable-hdpi file:///home/ramesh/Downlo
  app.get('/class-wise', async function(req, res, next) {
    var current_subs = req.query.id;
    res.cookie('class', req.query.id);
    console.log(req.cookies);
    var content = utils.getNextStep(req);
    var d = await queryfn.classwise(req.query.id);
    var filters = [
      { name: 'Class Wise', data: d.classes, link: 'class-wise' },
      { name: 'Subject Wise', data: d.subjects, link: 'subject-wise' },
      {
        name: 'Study Material By Board',
        data: d.boards,
        link: 'board-material',
      },
      { name: 'Your Interest Wise', data: d.topic, link: 'personalized' },
      { name: 'Govt. Exam Wise', data: d.govtexams, link: 'govt-exams' },
    ];
    console.log(filters[2]);
    res.render('site/class-wise', {
      title: 'Class List',
      filters: filters,
      content: content,
    });
  });
  app.post('/customselect', async (req, res) => {
    console.log(colors.bgGreen, JSON.stringify(req.cookies));
    var requestedSubject = req.body.subject;
    var requestedClass = req.body.class;
    var requestedBoard = req.body.board;
    if ((requestedClass == '' || !requestedClass) && !req.cookies.class) {
      // user never selected class, present classes.
      res.cookie('class', requestedClass);
      var response = await database.query('select * from tbl_standards', [], 1);
    } else if ((requestedSubject == '' || !requestedSubject) && !req.cookies.subject) {
      // user selected class but never selected subject
      res.cookie('class', requestedSubject);

      var response = await database.query('select * from tbl_subjects', [], 1);
    } else if ((requestedBoard == '' || !requestedBoard) && !req.cookies.board) {
      // user selected the other two but did not select the board
      res.cookie('class', requestedBoard);

      var response = await database.query('select * from tbl_boards', [], 1);
    }
    res.status(200).json(JSON.parse(response));
    /* pseudo code 
    
    */
  });

  app.get('/topics/:subject_id', async (req, res) => {
    var current_subs = req.query.id;
    var data;
    var query = 'SELECT id FROM tbl_boards LIMIT 1';
    boards = await database.query(query, []);
    var query = 'SELECT id FROM tbl_subjects LIMIT 1';
    sub = await database.query(query, []);
    var subject_id = req.params.subject_id;
    var topics = await database.query('select id, name from tbl_topic where subject_id=?', [subject_id]);
    res.render('site/general', {
      title: 'Topics',
      topics: topics,
      datasub: sub,
      boards: boards,
    });
  });

  app.get('/content/:topic_id', async (req, res) => {
    var query = 'SELECT id FROM tbl_boards LIMIT 1';
    boards = await database.query(query, []);
    var query = 'SELECT id FROM tbl_subjects LIMIT 1';
    sub = await database.query(query, []);
    var topic_id = req.params.topic_id;
    var query = 'SELECT id FROM tbl_boards LIMIT 1';
    boards = await database.query(query, []);
    var related_topics = database.query('select topics from topics where subject_id=?');
    var content = await database.query('select  * from tbl_contents where subject_id=?', [topic_id], 1);
    res.render('site/content', {
      title: 'Topics',
      content: content,
      datasub: sub,
      boards: boards,
    });
  });

  app.get('/subject-wise', async function(req, res, next) {
    var topic;
    var subject;
    var myclass;
    var education;
    var boards;
    //var current_drop = req.session.myclass;

    var current_subs = req.query.id;

    console.log(query);
    console.log(req.session);
    var query = 'SELECT id FROM tbl_boards LIMIT 1';
    boards = await database.query(query, []);

    var query = 'SELECT id FROM tbl_standards LIMIT 1';
    education = await database.query(query, []);
    query = 'SELECT * FROM tbl_standards ORDER BY id ASC';
    myclass = await database.query(query, []);

    var query = 'SELECT * FROM tbl_subjects ORDER BY id ASC';
    subject = await database.query(query, []);
    if (req.session.myclass) {
      var query =
        'SELECT * FROM tbl_topic where subject_id = ' + req.query.id + ' and class_id = ' + req.session.myclass;
      topic = await database.query(query, []);
      var topics = JSON.parse(topic);
      var bigclass = '';
    } else {
      var bigclass = JSON.parse(myclass);
      var topics = '';
    }
    var data = {
      boards: JSON.parse(boards),
      education: JSON.parse(education),
      myclass: JSON.parse(myclass),
      bigclass: bigclass,
      subject: JSON.parse(subject),
      topics: topics,
      current_drop: req.session.myclass,
      current_subs: current_subs,
    };
    res.render('site/subject-wise', {
      title: 'Class List',
      data: data,
    });
  });

  app.get('/selectclass', async function(req, res, next) {
    req.session.myclass = req.query.id;
    var query = 'SELECT * FROM  tbl_topic where class_id = ' + req.query.id + '  && subject_id=' + req.query.sid;
    //console.log(query);
    results = await database.query(query, []);
    // res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);
  });

  app.get('/myselect', async function(req, res, next) {
    req.session.myclass = req.query.id;
    var query = 'SELECT * FROM  tbl_standards ORDER BY id ASC';
    //console.log(query);
    results = await database.query(query, []);
    console.log(results);
    // res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);
  });

  app.get('/selectdesc', async function(req, res, next) {
    var query = 'SELECT description FROM  tbl_topic where id = ' + req.query.id;
    results = await database.query(query, []);
    // res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);
  });
  app.get('/txa', async (req, res) => {
    console.log(req.cookies);
    res.cookie('tx', 'asdasdf');
    res.json({});
  });
  app.get('/selectsubject', async function(req, res, next) {
    console.log(req.query);
    var query = 'SELECT * FROM  tbl_topic where subject_id = ' + req.query.id + '&& class_id=' + req.query.sid;
    results = await database.query(query, []);
    res.cookie('subject', req.query.id);
    // res.writeHead(200, {'Content-Type': 'application/json'});
    res.send(results);
  });

  app.get('/board-material', async function(req, res, next) {
    var board;
    var myboards;
    var sub;
    var education;
    var current_subs = req.query.id;
    var query = 'SELECT id FROM tbl_standards LIMIT 1';
    education = await database.query(query, []);
    var query = 'SELECT id FROM tbl_subjects LIMIT 1';
    sub = await database.query(query, []);
    var query = 'SELECT * FROM tbl_standards ORDER BY id ASC';
    board = await database.query(query, []);
    var query = 'SELECT * FROM tbl_boards';
    myboards = await database.query(query, []);
    var data = {
      education: JSON.parse(education),
      sub: JSON.parse(sub),
      board: JSON.parse(board),
      myboards: JSON.parse(myboards),
      current_subs: current_subs,
    };
    res.render('site/board-material', {
      title: 'Class List',
      data: data,
    });
  });
  // app.get('/entranc-exam',async function(req, res, next) {
  //      var eng
  //      var query = 'SELECT exam_type from tbl_exam_type';
  //      eng = await database.query(query, [] );
  //      console.log(eng);
  //      var data = {
  //         eng: JSON.parse(eng)
  //      }
  //     res.render('site/entranc-exam', {
  //         title: 'Class List',
  //         data: data
  //     })
  // })

  app.get('/career-guidance', function(req, res, next) {
    res.render('site/career-guidance', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/blog-discussion', async function(req, res, next) {
    var subjects;
    var classes;
    var boards;
    var query = 'SELECT * FROM tbl_subjects ORDER BY id ASC';
    subjects = await database.query(query, []);
    var query = 'SELECT * FROM tbl_standards   ORDER BY id ASC';
    classes = await database.query(query, []);
    var query = 'SELECT * FROM tbl_boards  ORDER BY id ASC';
    boards = await database.query(query, []);
    var data = {
      boards: JSON.parse(boards),
      classes: JSON.parse(classes),
      subjects: JSON.parse(subjects),
    };
    res.render('site/blog-discussion', {
      title: 'Add content',
      data: data,
    });
  });

  app.get('/blog_subjectwise', function(req, res, next) {
    res.render('site/blog_subjectwise', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/blog_subject_topic', function(req, res, next) {
    res.render('site/blog_subject_topic', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/test_your_self', async function(req, res, next) {
    var subjects;
    var classes;
    var boards;
    var query = 'SELECT * FROM tbl_subjects ORDER BY id ASC';
    subjects = await database.query(query, []);
    var query = 'SELECT * FROM tbl_standards  ORDER BY id ASC';
    classes = await database.query(query, []);
    var query = 'SELECT * FROM tbl_boards ORDER BY id ASC';
    boards = await database.query(query, []);
    var data = {
      boards: JSON.parse(boards),
      classes: JSON.parse(classes),
      subjects: JSON.parse(subjects),
    };
    res.render('site/test_your_self', {
      title: 'Add content',
      data: data,
    });
  });

  app.get('/entrance_exam', async function(req, res, next) {
    var exams,
      exams_list = [];
    var query = 'SELECT id ,exam_type from tbl_exam_type';
    exams = await database.query(query, []);
    exams = JSON.parse(exams);
    for (i = 0; i < exams.length; i++) {
      var query1 = 'SELECT * from tbl_exams where exam_type_id = ' + exams[i].id;
      // exams_list[exams[i].id]['exam_list'] = (JSON.parse(await database.query(query1, [] )));
      exams_list[exams[i].id] = exams[i];
      exams_list[exams[i].id].list = JSON.parse(await database.query(query1, []));
    }
    var data = {
      exams_list: exams_list,
      exams: exams,
    };
    res.render('site/entrance_exam', {
      title: 'Class List',
      data: data,
    });
  });
  app.get('/exam_detail', async function(req, res, next) {
    var q = url.parse(req.url, true).query;
    var exams,
      exams_list = [];
    var query = 'SELECT id ,exam_type from tbl_exam_type';
    exams = await database.query(query, []);
    exams = JSON.parse(exams);
    for (i = 0; i < exams.length; i++) {
      var query1 = 'SELECT * from tbl_exams Where exam_type_id = ' + exams[i].id;
      exams_list[exams[i].id] = exams[i];
      exams_list[exams[i].id].list = JSON.parse(await database.query(query1, []));
    }
    var examquery =
      'SELECT tbl_exam_type.* ,tbl_exams.* FROM tbl_exam_type INNER JOIN tbl_exams on tbl_exams.exam_type_id = tbl_exam_type.id where tbl_exams.id = ' +
      q.exam_id;
    var exam_detail = await database.query(examquery, []);
    var data = {
      exams_list: exams_list,
      exams: exams,
      exam_detail: JSON.parse(exam_detail)[0],
    };
    console.log(data);
    res.render('site/exam_detail', {
      title: 'exam detail',
      data: data,
    });
  });

  app.get('/engineering_entrancexam', function(req, res, next) {
    res.render('site/engineering_entrancexam', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/cbse-board', function(req, res, next) {
    res.render('site/cbse-board', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/career_after10', function(req, res, next) {
    res.render('site/career_after10', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/subject_subcategory', function(req, res, next) {
    res.render('site/subject_subcategory', {
      title: 'Class List',
      data: 'this is site index',
    });
  });
  app.get('/subject_topic', function(req, res, next) {
    res.render('site/subject_topic', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/subject-topic', function(req, res, next) {
    res.render('site/subject_topic', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/test_yourself_subjectwise', function(req, res, next) {
    res.render('site/test_yourself_subjectwise', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/test_yourself_subcategory', function(req, res, next) {
    res.render('site/test_yourself_subcategory', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/quiz_test', function(req, res, next) {
    res.render('site/quiz_test', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/admin/', function(req, res, next) {
    res.render('admin/index', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('/admin/dashboard', function(req, res, next) {
    res.render('admin/dashboard/index', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  app.get('dashboard/', function(req, res, next) {
    res.render('admin/dashboard/add-book', {
      title: 'Class List',
      data: 'this is site index',
    });
  });

  /**
   * We assign app object to module.exports
   *
   * module.exports exposes the app object as a module
   *
   * module.exports should be used to return the object
   * when this file is required in another module like app.js
   */
  return app;
};
