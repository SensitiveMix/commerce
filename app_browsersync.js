const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const engine = require('ejs-locals')
const users = require('./routes/users')
const admins = require('./routes/admin')
const services = require('./routes/services')
const english = require('./routes/fronted/front-en')
const german = require('./routes/fronted/front-de')
const products = require('./routes/admin/product')
const async = require('async')
const app = express()
const fs = require('fs')
const morgan = require('morgan')
const session = require('express-session')
const cors = require('cors')

var ppconfig = require('./payment/ppconfig/sandbox')
var paypal = require('paypal-rest-sdk')
var consolidate = require('consolidate')
var isDev = process.env.NODE_ENV !== 'production'
var port = 3000

let allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  next()
}

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', engine)
app.set('view engine', 'ejs')
app.use(allowCrossDomain)
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
if (process.env.NODE_ENV == 'production') {
    // create a write stream (in append mode)
  var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
    // setup the logger
  app.use(morgan('combined', {stream: accessLogStream}))
}
app.use(cors())
// 记录路由响应时间
app.use((req, res, next) => {
    // 记录start time:
  let exec_start_at = Date.now()
    // 保存原始处理函数:
  let _send = res.send
    // 绑定我们自己的处理函数:
  res.send = function () {
        // 发送Header:
    res.set('X-Execution-Time', String(Date.now() - exec_start_at))
        // 调用原始处理函数:
    return _send.apply(res, arguments)
  }
  next()
})
// 自定义异常
global.customError = (status, msg) => {
  if (typeof status === 'string') {
    msg = status
    status = null
  }
  var error = new Error(msg || '未知异常')
  error.status = status || 500
  return error
}

app.locals.env = process.env.NODE_ENV || 'dev'
app.locals.reload = false

if (isDev) {
  var webpack = require('webpack'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    webpackHotMiddleware = require('webpack-hot-middleware'),
    webpackDevConfig = require('./webpack.config.js')

  var compiler = webpack(webpackDevConfig)

  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackDevConfig.output.publicPath,
    noInfo: true,
    stats: {
      colors: true
    }
  }))
  app.use(webpackHotMiddleware(compiler))

  app.use('/', english)
  app.use('/users', users)
  app.use('/admin', admins)
  app.use('/service', services)
  app.use('/api/v1/admin', products)
  app.use('/en', english)
  app.use('/de', german)
    // production error handler

  paypal.configure({
    'mode': 'sandbox', // sandbox or live
    'client_id': ppconfig.client_id,
    'client_secret': ppconfig.client_secret,
    'grant_type': 'client_credentials',
    'content_type': 'application/x-www-form-urlencoded'
  })
    // payment
  app.get('/checkout', function (req, res) {
    console.log('-------------------------')
        // build PayPal payment request
    var payReq = {
      intent: 'sale',
      redirect_urls: {
        return_url: 'http://localhost:3000/return',
        cancel_url: 'http://localhost:3000/cancel'
      },
      payer: {
        payment_method: 'paypal'
      },
      transactions: [{
        amount: {
          total: parseInt(req.query.amount) * parseInt(req.query.price),
          currency: 'USD'
        },
        description: req.query.title
      }]
    }

    async.waterfall([
      function (callback) {
        paypal.generate_token(function (err, token) {
          if (err) {
            console.log('generate_token ERROR: ')
            console.log(err)
            callback(err)
          } else {
            console.log('----------------------------------------------------------')
            console.log('----------       ACCESS TOKEN RESPONSE          ----------')
            console.log('----------------------------------------------------------')
            console.log(JSON.stringify(token))
            callback(null, token)
          }
        })
      },
      function (token, callback) {
        console.log('----------------------------------------------------------')
        console.log('----------             CREATE PAYMENT           ----------')
        console.log('----------------------------------------------------------')
        console.log(JSON.stringify(payReq))

        paypal.payment.create(payReq, function (err, response) {
          if (err) {
            console.log('create payment ERROR: ')
            console.log(err)
            callback(err)
          } else {
            console.log('----------------------------------------------------------')
            console.log('----------     CREATE PAYMENT RESPONSE          ----------')
            console.log('----------------------------------------------------------')
            console.log(JSON.stringify(response))

            var url = response.links[1].href
            var tmpAr = url.split('EC-')
            var token = {}
            token.redirectUrl = 'https://www.sandbox.paypal.com/checkoutnow?useraction=commit&token=EC-' + tmpAr[1]
            token.token = 'EC-' + tmpAr[1]
            console.log('------ Token Split ------')
            console.log(token)

            callback(null, token)
          }
        })
      }], function (err, result) {
      if (err) {
        console.log('An ERROR occured!')
        console.log(err)
        res.json(err)
      } else {
        console.log('----------------------------------------------------------')
        console.log('----------          REDIRECTING USER            ----------')
        console.log('----------------------------------------------------------')
        console.log(result.redirectUrl)
        res.redirect(result.redirectUrl)
      }
    })
  })
  app.get('/return', function (req, res) {
    console.log('----------------------------------------------------------')
    console.log('----------       RETURN WITH QUERY PARAMS       ----------')
    console.log('----------------------------------------------------------')
    console.log(JSON.stringify(req.query))
    console.log('-------------------------')
    paypal.payment.get(req.query.paymentId, function (err, payment) {
      if (err !== null) {
        console.log('ERROR')
        console.log(err)
        res.json(err)
      } else {
        console.log('----------------------------------------------------------')
        console.log('----------             PAYMENT DETAILS          ----------')
        console.log('----------------------------------------------------------')
        console.log(JSON.stringify(payment))
        var execute_details = {'payer_id': payment.payer.payer_info.payer_id}
        paypal.payment.execute(payment.id, execute_details, function (err, response) {
          if (err !== null) {
            console.log('ERROR')
            console.log(err)
            res.json(err)
          } else {
            console.log('----------------------------------------------------------')
            console.log('----------      PAYMENT COMPLETED DETAILS       ----------')
            console.log('----------------------------------------------------------')
            console.log(JSON.stringify(response))
            var displayData = 'ID: ' + response.id + '<br />State: ' + response.state + '<br />'
            res.send(displayData)
          }
        })
      }
    })
  })

  app.get('/cancel', function (req, res) {
    console.log(req.query)
    res.redirect('/')
  })

    // browsersync is a nice choice when modifying only views (with their css & js)
  let bs = require('browser-sync').create()
  app.listen(port, function () {
    bs.init({
      open: true,
      ui: false,
      notify: false,
      proxy: 'localhost:3000',
      files: ['./views/**'],
      port: 8080
    })
    console.log('App (dev) is going to be running on port 8080 (by browsersync).')
  })
} else {
  app.use(express.static(path.join(__dirname, 'public')))
  app.use('/', english)
  app.use('/users', users)
  app.use('/admin', admins)
  app.use('/service', services)
  app.use('/api/v1/admin', products)
  app.use('/en', english)
  app.use('/de', german)
  app.listen(port, () => {
    console.log('App (production) is now running on port 3000!')
  })
}
