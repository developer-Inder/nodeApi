var express = require('express');
var app = express();
var expressValidator = require('express-validator');
var path = require('path');
// var busboy = require('then-bugsboy')
var fileUpload = require('express-fileupload');
var mysql = require('mysql');
// var exp = require('exports')
var fs = require('fs');
var session = require('express-session');
var cors = require('cors');
var passport = require('passport');
var cnt = require('connect-ensure-login');
var flash = require('connect-flash');
const { passport_config } = require('./config/passport');
const utils = require('./utils/utils');
const config = require('./config/config');
var corsOptions = {
  origin: [config.SSR_URL, config.SSR_URL2, 'http://localhost:8080', 'http://localhost:8081'],
  credentials: true,
};
app.use(cors(corsOptions));
// app.use(cors)
app.use(flash());
/**
 * This middleware provides a consistent API
 * for MySQL connections during request/response life cycle
 */

var myConnection = require('express-myconnection');
/**
 * Store database credentials in a separate config.js file
 * Load the file/module and its values
 */
// var config = require('./config')
// var dbOptions = {
//     host:      config.database.host,
//     user:       config.database.user,
//     password: config.database.password,
//     port:       config.database.port,
//     database: config.database.db
// }
var bodyParser = require('body-parser');
/**
 * bodyParser.urlencoded() parses the text as URL encoded data
 * (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body.
 */
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json({extended: true}))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ extended: true }));

app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true, cookie: { maxAge: 60000 } }));

app.use(passport.initialize());
app.use(passport.session());
passport_config(passport);

/**
 * 3 strategies can be used
 * single: Creates single database connection which is never closed.
 * pool: Creates pool of connections. Connection is auto release when response ends.
 * request: Creates new connection per new request. Connection is auto close when response ends.
 */
//app.use(myConnection(mysql, dbOptions, 'pool'))

/**
 * setting up the templating view engine
 */
app.set('view engine', 'ejs');
var router = express.Router();

var cookieParser = require('cookie-parser');
app.use(cookieParser('keyboard cat'));
app.get('/testxt', (req, res) => {
  console.log(req.cookies);
  res.json(req.cookies);
});
/**
 * import routes/index.js
 * import routes/users.js
 */
var index = require('./routes/index')(passport);
var users = require('./routes/users')(passport);
var cl = require('./routes/class')(passport);
var cont = require('./routes/contents')(passport);
var board = require('./routes/board')(passport);
var fld = require('./routes/topic')(passport);
var strm = require('./routes/streams')(passport);
var sbj = require('./routes/subject')(passport);
var exm = require('./routes/exam')(passport);
var tcr = require('./routes/category')(passport);
var home = require('./routes/home')(passport);
var site = require('./routes/site')(passport);
var admin = require('./routes/admin')(passport);
var reg = require('./routes/registration')(passport);
var api = require('./routes/api')(passport);
var adminapi = require('./routes/admin-api')(passport);
var frontend = require('./routes/frontend')(passport);
var blogcontent = require('./routes/blogcontent')(passport);
var quiz = require('./routes/quiz')(passport);
var test = require('./routes/test')(passport);
var report = require('./routes/score')(passport);
var dashboard = require('./routes/score')(passport);
// var userLogin = require('./routes/frontend')(passport)
// for front end
/*app.get('/', function(req, res){
    res.render('index',{user:"John Smith"})
  }); */
app.use(fileUpload());
/**
 * Express Validator Middleware for Form Validation
 */
app.use(expressValidator());

/**
 * body-parser module is used to read HTTP POST data
 * it's an express middleware that reads form's input
 * and store it as javascript object
 */
/**
 * This module let us use HTTP verbs such as PUT or DELETE
 * in places where they are not supported
 */
var methodOverride = require('method-override');

/**
 * using custom logic to override method
 *
 * there are other ways of overriding as well
 * like using header & using query value
 */

app.use(
  methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

/**
 * This module shows flash messages
 * generally used to show success or error messages
 *
 * Flash messages are stored in session
 * So, we also have to install and use
 * cookie-parser & session modules
//  */

//app.use('/admin', utils.ensureLoggedIn())
app.use('/', index);
app.use('/admin', admin);
//app.use('/reb/users', users)
app.use('/admin/class', cl);
app.use('/admin/content', cont);
app.use('/admin/boards', board);
app.use('/admin/topic', fld);
//app.use('/reb/streams',strm)
app.use('/admin/subject', sbj);
app.use('/admin/exam', exm);
app.use('/quiz', quiz);
app.use('/userReport', report);
app.use('/dashboard', dashboard);
// app.use('/report', report)
app.use('/admin/category', tcr);
//app.use('/reb/home',home)
app.use('/site', site);

app.use('/register', reg);
app.use('/api', api);
app.use('/test', test);
app.use('/admin-api', adminapi);
app.use('/frontend', frontend);
// app.use('/userLogin', userLogin)
app.use('/blogcontent', [/*utils.ensureLoggedIn,*/ blogcontent]);

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'assets/uploads/pdf/')));

app.listen(3000, function() {
  console.log('Server running at port 3000: http://127.0.0.1:3000');

  process

    // Handle normal exits
    .on('exit', code => {
      nodemon.emit('quit');
      process.exit(code);
    })

    // Handle CTRL+C
    .on('SIGINT', () => {
      nodemon.emit('quit');
      process.exit(0);
    });
});
