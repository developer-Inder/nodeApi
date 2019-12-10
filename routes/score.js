var express = require('express');
var app = express();
var crypto = require('crypto');
var utils = require('../utils/utils');
var config = require('../config/config');
var jwt = require('jsonwebtoken');
const { database } = require('../utils/db.js');

module.exports = function(passport) {
  app.get('/userScore', async function(req, res, next) {
    var currentDate = await utils.getCurrentTime();

    var today_number_of_quizes = await database.query(
      'SELECT count(attemped_question) as ids from active_quizzes  where date(created_at) = ? and user_id = ? ',
      [currentDate, req.query.user_id]
    );
    today_number_of_quizes = JSON.parse(today_number_of_quizes);
    var today_complete_quiz = await database.query(
      'SELECT count(attemped_question) as ids from active_quizzes  where date(created_at) = ? and user_id = ? && attemped_question = ?',
      [currentDate, req.query.user_id, '1']
    );
    today_complete_quiz = JSON.parse(today_complete_quiz);
    var today_un_complete_quiz = await database.query(
      'SELECT count(attemped_question) as ids from active_quizzes  where date(created_at) = ? and user_id = ? && attemped_question = ?',
      [currentDate, req.query.user_id, '0']
    );
    today_un_complete_quiz = JSON.parse(today_un_complete_quiz);
    var today_complete_quizz = {
      today_play_number_of_quizes: today_number_of_quizes,
      today_complete_quiz: today_complete_quiz,
      today_uncomplete_quiz: today_un_complete_quiz,
    };
    var finalReport = { todayReport: today_complete_quizz };
    res.json(finalReport);
  });
  app.get('/totalAverage', async function(req, res, next) {
    var result = await database.query(
      'SELECT tbl_topic.name,count(active_quizzes.id) as total_quizzes_play,active_quizzes.topic_id,sum(active_quizzes.right_answer) as right_answer,sum(active_quizzes.total_question) as total_question,active_quizzes.created_at FROM active_quizzes INNER JOIN tbl_topic ON active_quizzes.topic_id = tbl_topic.id GROUP BY active_quizzes.topic_id'
    );
    result = JSON.parse(result);
    if (result) {
      var response = { averageScore: result };
      res.json(response);
    } else {
      var response = { message: 'Data not found' };
      res.json(response);
    }
  });
  app.post('/performanceData', async function(req, res, next) {
    var currentYear = await utils.getCurrentYear();
    var yearlyPerformance = await database.query(
      'SELECT count(attemped_question) as quizes,MONTH(created_at) as month,YEAR(created_at) as year,sum(total_question) as total_question,sum(right_answer) as right_answer  FROM `active_quizzes` WHERE YEAR(created_at) = ? && user_id = ? GROUP BY month(created_at)',
      [currentYear, req.body.user_id]
    );
    yearlyPerformance = JSON.parse(yearlyPerformance);
    var dateWeekBefore = await utils.getWeekBefore();
    var weeklyPerformance = await database.query(
      'SELECT count(attemped_question) as quizzes,sum(total_question) as total_question,sum(right_answer) as right_answer,created_at FROM `active_quizzes` WHERE  user_id = ? and created_at >= ? GROUP BY DAY(created_at) ORDER by created_at ASC',
      [req.body.user_id, dateWeekBefore]
    );
    weeklyPerformance = JSON.parse(weeklyPerformance);

    var months = [];
    var quizes = [];
    yearlyPerformance.forEach(yearlyData => {
      var month_calculate = utils.getMonthYear(yearlyData.month, yearlyData.year);
      months.push(month_calculate);
      // quizes.push(yearlyData.quizes);
      quizes.push((yearlyData.right_answer * 100) / yearlyData.total_question);
    });
    //Get Weekly records
    var days = [];
    var quizesWeek = [];
    // console.log(weeklyPerformance);
    var totalQuizzes = [];
    weeklyPerformance.forEach(weeklyData => {
      quizesWeek.push((weeklyData.right_answer * 100) / weeklyData.total_question);
      totalQuizzes.push(weeklyData.quizzes);
      var datee = new Date(weeklyData.created_at);
      var datss = datee.getDay();
      var day_calculate = utils.getDayYear(datss);
      days.push(day_calculate);
    });
    var des = 'percentScore';
    var finalReport = {
      yearlyPerformance: { months: months, datasets: { label: 'percentScore', data: quizes } },
      weeklyPerformance: {
        days: days,
        datasets: [
          { label: 'percentScore', data: quizesWeek },
          { label: 'quizCount', data: totalQuizzes },
        ],
      },
    };
    res.json(finalReport);
  });
  return app;
};
