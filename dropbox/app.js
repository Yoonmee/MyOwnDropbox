var createError = require('http-errors');
var express = require('express');
const http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const db = require('./db.js');
const session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const secret_key = crypto.randomBytes(48);
var handlers = require('./handlers');
var routerr = require('./router');

var app = express();

app.use(session({
    secret: secret_key.toString('hex'),
    resave: false,
    saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// app.use('/', indexRouter);
// app.use('/users', usersRouter);
const router = require('./routes/router.js')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var routes = {
    '/home': handlers.home,
  '/upload': handlers.upload,
  '_static': handlers.serveStatic
};

function start(route, routes) {

  function onRequest(request, response) {

    var pathname = url.parse(request.url).pathname;
    var postData = '';

    request.setEncoding('utf8');

    request.addListener('data', function (postDataChunk) {
      postData += postDataChunk;
    });

    request.addListener('end', function () {
      route(routes, pathname, response, postData);
    });
  }
  const server = app.listen(3000, function () {

    console.log('Listening on port 3000');
  });

}
const s = start(routerr.route, routes);

module.exports = app;
