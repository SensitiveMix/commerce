const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const engine = require('ejs-locals')
const morgan = require('morgan')
const fs = require('fs')
const https = require('https')
const cors = require('cors')
const db = require('./model/index')
const routes = require('./routes/index')
const users = require('./routes/users')
const admins = require('./routes/admin')
const services = require('./routes/services')
const products = require('./routes/admin/product')
const english = require('./routes/fronted/front-en')
const german = require('./routes/fronted/front-de')

const ppconfig = require('./payment/ppconfig/sandbox')
const paypal = require('paypal-rest-sdk')
const session = require('express-session')
const app = express()

app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', engine)
app.set('view engine', 'ejs')
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

if (process.env.NODE_ENV === 'production') {
  let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
  app.use(morgan('combined', {stream: accessLogStream}))
}
app.use(cors())

global.db = db

// 记录路由响应时间
app.use((req, res, next) => {
  console.log(req.url)
  // 记录start time:
  let expiredAt = Date.now()
  // 保存原始处理函数:
  let _send = res.send
  // 绑定我们自己的处理函数:
  res.send = function () {
    // 发送Header:
    res.set('X-Execution-Time', String(Date.now() - expiredAt))
    // 调用原始处理函数:
    return _send.apply(res, arguments)
  }
  next()
})

// 自定义异常
global.customError = (status, msg, res) => {
  if (typeof status === 'string') {
    msg = status
    status = null
  }
  let error = new Error(msg || '未知异常')
  error.status = status || 500

  return res.send({code: error.status, msg: error.msg})
}

let isDev = process.env.NODE_ENV !== 'production'
app.locals.env = process.env.NODE_ENV || 'dev'
app.locals.reload = true

function normalizePort (val) {
  let port = parseInt(val, 10)
  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}

let port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

if (isDev) {
  console.log('dev-env')
  // static assets served by webpack-dev-middleware & webpack-hot-middleware for development
  let webpack = require('webpack')
  let webpackDevMiddleware = require('webpack-dev-middleware')
  let webpackHotMiddleware = require('webpack-hot-middleware')
  let webpackDevConfig = require('./webpack.config.js')

  let compiler = webpack(webpackDevConfig)

  // attach to the compiler & the server
  app.use(webpackDevMiddleware(compiler, {

    // public path should be the same with webpack config
    publicPath: webpackDevConfig.output.publicPath,
    noInfo: true,
    stats: {
      colors: true
    }
  }))
  app.use(webpackHotMiddleware(compiler))
  // add "reload" to express, see: https://www.npmjs.com/package/reload
  // var reload = require('reload');

  app.use('/', english)
  app.use('/users', users)
  app.use('/admin', admins)
  app.use('/service', services)
  app.use('/api/v1/admin', products)
  app.use('/en', english)
  app.use('/de', german)

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res) {
    console.log(req)
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: {}
    })
  })

  var server = https.createServer(app)
  // reload(server, app);

  server.listen(port, function () {
    console.log('App (dev) is now running on port 3000!')
  })
} else {
  app.use(express.static(path.join(__dirname, 'public')))
  // add "reload" to express, see: https://www.npmjs.com/package/reload
  // var reload = require('reload');
  app.use('/', routes)
  app.use('/users', users)
  app.use('/admin', admins)
  app.use('/service', services)
  app.use('/api/v1/admin', products)
  app.use('/en', english)
  app.use('/de', german)

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res) => {
    console.log(req)
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: {}
    })
  })
  paypal.configure({
    'mode': 'sandbox', // sandbox or live
    'client_id': ppconfig.client_id,
    'client_secret': ppconfig.client_secret,
    'grant_type': 'client_credentials',
    'content_type': 'application/x-www-form-urlencoded'
  })

  app.listen(port, () => { console.log('App (production) is now running on port 3000!') })
}

module.exports = app
