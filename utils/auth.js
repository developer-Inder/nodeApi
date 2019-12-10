var bcrypt = require('bcryptjs');

var config = require('../config/config.js');
var user = require('../models/user');
var jwt = require('jsonwebtoken');
var owasp = require('owasp-password-strength-test');
var nodemailer = require('nodemailer');
var mailer = require('./helpers/mail.js');
var helpers = require('./helpers/helpers.js');
var mailotp = require('./helpers/otp');
var mailotptr = require('./helpers/otptr');
var mailreset = require('./helpers/reset');
var mailverify = require('./helpers/mailverify');

var request = require('request');
var sgMail = require('@sendgrid/mail');
var cnct = require('connect-ensure-login');
auth = req => {
  var username = req.body.username;
  var password = req.body.password;
  return auth(username, password);
};
User = () => {};

postRegister = function(req, res) {
  var reqBody = req.body;
  req.assert('email', 'Please input a valid email').notEmpty(); //Validate name
  //     req.assert('name', 'Class-Name is required').notEmpty()
  req
    .body('email')
    .isEmail()
    .normalizeEmail()
    .trim()
    .escape()
    .withMessage('Invalid Email');
  var email = reqBody.email.toLowerCase();

  if (user.exists(reqBody.email)) {
    var result = owasp.test(req.body.password[0]);
    if (result.errors.length == 0) {
      var hashedPassword = bcrypt.hashSync(req.body.password[0], 8);
      usr = new User({
        firstname: reqBody.name,
        lastname: reqBody.lastname,
        phone: reqBody.phone,
        email: reqBodyemail,
        password: hashedPassword,
        role: reqBody.role,
        verified: false,
        token: '',
        status: 0,
      });
      [err, user] = user.save(req.body);
      if (err) return res.status(500).send('There was a problem registering the user.');

      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 300,
      });

      var link = 'https://revoedubook.com/activate?&token=' + token + '&email=' + email;
      var response = sendMail(
        newAccount.userdetails.email,
        'Please Verify your email. ',
        mailverify(email, link),
        sgMail
      );
      res.send({ status: 'ok', message: 'Sign Up Successful. Please check your email.' });
    } else {
      res.send({ status: 'error', message: result.errors });
    }
  } // if user did not exist...
  else {
    res.status(422).render({ status: 'error', message: 'This user already Exist.' });
    return;
  }
};
activate = function(req, res) {
  var email = req.query.email.toLowerCase();
  User.findOne({ email: req.query.email }, function(err, user) {
    if (user.verify(email)) {
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400, // expires in 24 hours
      });

      //  res.cookie('access_token', token, { httpOnly: true }).status(301).redirect('/login');

      res.redirect('/login');
    }
  });
};

const reset = async function(req, res) {
  var email = req.body.email.toLowerCase();
  [err, user] = await user.exists({ email: email });

  if (!user) {
    res
      .status(422)
      .send({ message: 'If the user exists in our database the email will be sent. Please check your email.' });
    return;
  } else {
    var token = jwt.sign({ id: user.id, type: 'reset' }, config.secret, {
      expiresIn: 86400, // expires in 24 hours
    });
    user.resetToken = token;
    user.verified = false;

    user.save(function(err, user) {
      if (err) return res.status(500).send({ message: 'There was a problem registering the request.' });
      var link = 'https://revoedubook.com/reset-password?&token=' + token + '&email=' + email;

      var mailSent = sendMail(
        user.email,
        'Someone requested a password reset. If it is not you, please email us at webmaster@revoedubook.com',
        mailreset(user.email, link),
        sgMail
      );
    });

    res.send({ message: 'A mail has been sent. Please check your email.' });
  }
};

getResetRequestFromEmail = async function(req, res) {
  var email = req.query.email.toLowerCase();
  [err, user] = await user.exists({ email: email, resetToken: req.query.token, verified: false });
  if (err) throw err;
  if (!user) {
    res.end('malformed request!');
  } else {
    jwt.verify(req.query.token, config.secret, function(err, decoded) {
      if (err) {
        return res.status(422).render('reset-password.ejs', { success: false, message: 'Failed to authenticate.' });
      } else {
        res.cookie('resetToken', req.query.token, { httpOnly: true });
        res.cookie('email', email, { httpOnly: true });
        user.resetToken = req.query.token;
        user.verified = true;
        user.save();
        res.render('reset-password.ejs', { message: 'Please enter your password' });
      }
    });
  }
};

postResetPassword = async function(req, res) {
  User.findOne({ email: req.cookies.email, resetToken: req.cookies.resetToken }, function(err, user) {
    if (!user) {
      res.render('response.ejs', { message: 'Malformed request with non matching records. Please contact support.' });
      return;
    } else {
      var result = owasp.test(req.body.password[0]);
      if (result.errors.length == 0) {
        var hashedPassword = bcrypt.hashSync(req.body.password[0], 8);
        user.password = hashedPassword;
        //     user.resetToken = null;
        user.verified = true;

        user.save(function(err, user) {
          if (err)
            return res
              .status(500)
              .render('reset-email.ejs', { message: 'There was a problem changing your password. Please try again.' });
          // create a token
          // var token = jwt.sign({ id: user._id }, config.secret, {
          //     expiresIn: 86400 // expires in 24 hours
          // });

          // var link = 'A password reset request has been sent for your email. <a style="padding:20px;background:green;" href="https://tccworld.org/activate?&token=' + token + '&email=' + req.body.email + '"> Reset My Password.</a>';
          // var response = sendMail(newAccount.userdetails.email, "", link);
          res.render('success.ejs', { message: 'Password change successful. Please login.' });
        });
      } else {
        res.status(422).render('response.ejs', { message: result.errors });
      }
    }
  });
};

(postOtp = () => cnct.ensureLoggedIn()),
  function(req, res) {
    // var random = String(Math.floor(Math.random() * 1000000));
    // mailotptext = "Your OTP is:" + random;
    // // console.log(random.length);
    // if (random.length <= 5) {

    //     random = random + "4";

    // }

    otp = generateOtp();

    var response = sendMail(
      req.user.email,
      'Your High Security OTP for sending TCC',
      mailotptr(req.user.email, random),
      sgMail
    );

    res.status(200).json({ success: true, message: 'OTP sent! Please check your email.' });
  };

(logout = () => cnct.ensureLoggedIn()),
  function(req, res) {
    cookie = req.cookies;
    for (var prop in cookie) {
      if (!cookie.hasOwnProperty(prop)) {
        continue;
      }
      res.cookie(prop, '', { expires: new Date(0) });
    }
    if (req.session) {
      // delete session object
      req.session.destroy(function(err) {
        if (err) {
          return next(err);
        } else {
          // return res.redirect('/login');
        }
      });
    }
    req.logout();

    res.json('logged out');
  };
