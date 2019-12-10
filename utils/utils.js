const { database } = require('./db');
var fs = require('fs-extra');
var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const esclient = require('./connection');
const queryfn = require('./queryfn');
verifyToken = async (token, secret, callback) => {
  jwt.verify(token, secret, async function (err, decoded) {
    if (err) {
      callback(err, null);
    } else {
      var user = await callback(null, decoded);
      return user;
    }
  });
};
getNextStep = async req => {
  var c = req.cookies;
  if (!req.cookies.subject) {
    // user selected class but never selected subject

    var response = await database.query('select * from tbl_subjects', [], 1);
  } else if (!req.cookies.board) {
    // user selected the other two but did not select the board
    var response = await database.query('select * from tbl_boards', [], 1);
  } else {
    response = await database.query('select * from topics where class_id=? and subject_id=? and board_id=?', [
      c.class,
      c.subject,
      c.board,
    ]);
  }
  return response;
};

createDir = directory => {
  var success;

  fs.ensureDir(directory, err => {
    console.log(err); // => null
    if (err) return false;
    else return true;
    // dir has now been created, including the directory it is to be placed in
  });
};
ensureLoggedIn = function (req, res, next) {
  token = req.headers.authorization ? req.headers.authorization : req.cookies.token ? req.cookies.token : null;

  if (token !== 'Bearer undefined' && token !== 'undefined' && token) {
    console.log(typeof token);
    token = token.substring(7, token.length);
    jwt.verify(token, config.secret, async function (err, decoded) {
      if (err) {
        res.json({ success: false, message: 'Failed to authenticate.', err: err });
        return;
      } else console.log(decoded);
      var user = require('../models/user');

      user = await user.findById(decoded.id);

      req.user = user;
      next();
    });
  } else {
    console.log('User not logged in');
    next();
  }
};
store_selected_item = async function (user, body) {
  if (user) {
    const result = await esclient.search({
      index: 'default_items',
      body: { user_id: user.id },
    });
    if (result) {
      var operation_result = await client.update({
        id: result.id,
        index: 'default_items',
        body: object,
        // type: string,
        // wait_for_active_shards: string,
        // _source: string | string[],
        // _source_excludes: string | string[],
        // _source_includes: string | string[],
        // lang: string,
        // refresh: 'true' | 'false' | 'wait_for',
        // retry_on_conflict: number,
        // routing: string,
        // timeout: string,
        // if_seq_no: number,
        // if_primary_term: number,
      });
    } else {
      new_user_body = {
        user_id: user.id,
      };
      Object.assign(new_user_body, body);
      var operation_result = await esclient.index({
        index: 'default_items',
        type: '_doc',
        body: new_user_body,
      });
      return operation_result;
    }
  } else {
    console.log(user);
  }
};

get_selected_item_children = async function (item_type, item_id, cookies) {
  var array = ['boards', 'standards', 'subjects'];
  console.log('xxxxxxxx index of ' + item_type, array);
  var filtered = array.filter(function (value, index, arr) {
    obj_keys = Object.keys(cookies);
    // console.log("logging value...." + value, obj_keys.indexOf(value) < 0)
    return obj_keys.indexOf(value) < 0;
  });
  if (filtered.length > 0) {
    console.log('filtered length > 0 .....', item_type in array);
    var result = await queryfn.fillSingleData(filtered[0]);
    var key = filtered[0];
  }
  // later each board or class should be filled with values like classes and boards and subjects which are valid..
  // for now, all the boards or classes available are being returned
  // if (cookies.default_items.board)
  //     const result = await esclient.search({
  //         index: item_type,
  //         body: { "id": item_id }
  //     })
  else if (array.indexOf(item_type) >= 0 && filtered.length == 0) {
    //selecting one of them again..
    //   console.log("entered in if boards ..", )
    console.log('item type in array.....', filtered);

    var result = await database.query(
      'select * from tbl_topic where board_id = ? AND class_id = ? AND subject_id = ? and parent_topic_id=0 ',
      [cookies.boards, cookies.standards, cookies.subjects]
    );
    var key = 'topic';
  } else if (item_type == 'topic' && filtered.length == 0) {
    console.log('item type is topic .....', item_id);

    var result = await database.query('select * from tbl_topic where parent_topic_id = ?', [item_id]);

    var key = 'topic';
    if (!result.length) {
      console.log('item type no result as parent _topic fetching lesson .....', item_id);

      var relatedTopics = await findRelatedTopics(item_id, cookies);
      var relatedParentTopics = await findRelatedTopics(item_id, cookies);
      //  var activeLesson = await findActiveLesson(item_id)
      key = 'lesson';
      result = { /*activeLesson,*/ relatedTopics, relatedParentTopics };
      console.log(result);
    } else {
      // if it is a parent_topic
    }
    console.log('entered in ');
    if (result == []) result = [{ name: 'No lessons Found. Please try another topic' }];
    // else result = JSON.parse(result)
  }
  if (typeof result !== 'object') result = JSON.parse(result);
  return { result: result, key: key };
};


get_test_children = async function (item_type, item_id, cookies) {
  var array = ['standards', 'subjects'];
  console.log('xxxxxxxx index of ' + item_type, array);
  var filtered = array.filter(function (value, index, arr) {
    obj_keys = Object.keys(cookies);
    // console.log("logging value...." + value, obj_keys.indexOf(value) < 0)
    return obj_keys.indexOf(value) < 0;
  });
  if (filtered.length > 0) {
    console.log('filtered length > 0 .....', item_type in array);
    var result = await queryfn.fillSingleData(filtered[0]);
    var key = filtered[0];
  }
  // later each board or class should be filled with values like classes and boards and subjects which are valid..
  // for now, all the boards or classes available are being returned
  // if (cookies.default_items.board)
  //     const result = await esclient.search({
  //         index: item_type,
  //         body: { "id": item_id }
  //     })
  else if (array.indexOf(item_type) >= 0 && filtered.length == 0) {
    //selecting one of them again..
    //   console.log("entered in if boards ..", )
    console.log('item type in array.....', filtered);

    var result = await database.query(
      'select * from tbl_test_topics where class_id = ? AND subject_id = ? and parent_topic_id=0 ',
      [cookies.standards, cookies.subjects]
    );
    var key = 'topic';
  } else if (item_type == 'topic' && filtered.length == 0) {
    console.log('item type is topic .....', item_id);

    var result = await database.query('select * from tbl_topic where parent_topic_id = ?', [item_id]);

    var key = 'topic';
    if (!result.length) {
      console.log('item type no result as parent _topic fetching lesson .....', item_id);

      var relatedTopics = await findRelatedTopics(item_id, cookies);
      var relatedParentTopics = await findRelatedTopics(item_id, cookies);
      //  var activeLesson = await findActiveLesson(item_id)
      key = 'lesson';
      result = { /*activeLesson,*/ relatedTopics, relatedParentTopics };
      console.log(result);
    } else {
      // if it is a parent_topic
    }
    console.log('entered in ');
    if (result == []) result = [{ name: 'No lessons Found. Please try another topic' }];
    // else result = JSON.parse(result)
  }
  if (typeof result !== 'object') result = JSON.parse(result);
  return { result: result, key: key };
};
sendMail = async function (sender_email, token) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'revolutioxx@gmail.com',
      pass: 'revomail@#A1',
    },
  });

  var mailOptions = {
    from: 'youremail@gmail.com',
    to: sender_email,
    subject: 'Sending Email using Node.js',
    html: `<a href="http://localhost:8080/register/verify?token=${token}">Click here to verify.</a>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
getCurrentTime = async function () {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  return today;
};
getCurrentYear = async function () {
  var today = new Date();
  var yyyy = today.getFullYear();
  today = yyyy;
  // console.log(today)
  return today;
};
getDayYear = function (day) {
  var cars = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var day = cars[day];
  return day;
};
getMonthYear = function (month, year) {
  var finalMonth = month - 1;
  var cars = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var day = cars[finalMonth] + '-' + year;
  return day;
};
getWeekBefore = function () {
  var d = new Date();
  d.setDate(d.getDate() - 7);
  // console.log(d);
  return d;
};
findRelatedTopics = async (topic_id, cookies) => {
  console.log(cookies);
  var relatedTopics = await database.query(
    'select * from tbl_topic where board_id = ? AND class_id = ? AND subject_id = ? AND parent_topic_id = ? order by frequency LIMIT 7',
    [cookies.boards, cookies.class, cookies.subjects, topic_id]
  );
  console.log('related topics', relatedTopics);
  relatedTopics = relatedTopics.length ? JSON.parse(relatedTopics) : [];

  return relatedTopics;
};
findRelatedParentTopics = async (topic_id, cookies) => {
  console.log('asdfas topics', topic_id);
  cookies = { boards: 8, class: 3, subjects: 99 };
  var parent_topic = await database.query('select parent_topic_id from tbl_topic where id = ?', [topic_id]);
  //parent_topic = JSON.parse(parent_topic)[0].parent_topic
  console.log(parent_topic);
  if (parent_topic) {
    console.log('asda', parent_topic);
    return await findRelatedTopics(parent_topic, cookies);
  } else return [];
};
findActiveLesson = async topic_id => {
  var activeLesson = await database.query('select * from tbl_contents where topic_id = ?', [topic_id]);
  console.log('active lesson', activeLesson);
  return activeLesson.length ? JSON.parse(activeLesson) : [];
};
getcareerData = async (parent_id, namee) => {
  var str = `(${parent_id})`;
  var careerData = await database.query(
    'SELECT career.name,career.id,career_paths.pathName as pathName FROM career INNER JOIN career_paths ON career.parent = career_paths.path_id WHERE parent in ' +
    str +
    ' GROUP BY career.id'
  );
  careerData = JSON.parse(careerData);
  return careerData;
};
respond = (result, res) => {
  if (!result.length) {
    res.json({ status: false, statusCode: 511, message: "No data found" })
  }
  else {
    res.json(result)
  }
}
module.exports = {
  get_test_children,
  respond,
  getNextStep,
  createDir,
  ensureLoggedIn,
  findRelatedTopics,
  findRelatedParentTopics,
  findActiveLesson,
  store_selected_item,
  get_selected_item_children,
  store_selected_item,
  sendMail,
  verifyToken,
  getCurrentTime,
  getCurrentYear,
  getDayYear,
  getMonthYear,
  getWeekBefore,
  getcareerData,
};
