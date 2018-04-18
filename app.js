var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

var index = require('./routes/index')
var api = require('./routes/api')
var api1 = require('./routes/api1')
var api2 = require('./routes/api2')

var app = express()

/* allow from port 3001 & from webclient */
var cors = require('cors');
app.use(cors({origin: 'http://localhost:3001'}));
//app.use(cors({origin: 'https://seng3011-web-client.firebaseapp.com/'}));

/* view engine setup */
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', api) /* redirect to the latest api */
app.use('/api', api)
app.use('/api/v1', api1)
app.use('/api/v2', api2)

/* catch 404 and forward to error handler */
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

/* error handler */
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
