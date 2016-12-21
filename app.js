var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http').Server(express);
var partials = require('express-partials');
var engine = require('ejs-locals');
var https = require('http');
var morgan = require('morgan');
var fs = require('fs');
var cors = require('cors');

var routes = require('./routes/index');
var users = require('./routes/users');
var admins = require('./routes/admin');
var services = require('./routes/services');

var cheerio = require('cheerio');
var superagent = require('superagent');
var ppconfig = require('./payment/ppconfig/sandbox');
var paypal = require('paypal-rest-sdk');
var async = require('async');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
// setup the logger
app.use(morgan('combined', {stream: accessLogStream}))
app.use(cors());

//记录路由响应时间
app.use(function (req, res, next) {
    // 记录start time:
    var exec_start_at = Date.now();
    // 保存原始处理函数:
    var _send = res.send;
    // 绑定我们自己的处理函数:
    res.send = function () {
        // 发送Header:
        res.set('X-Execution-Time', String(Date.now() - exec_start_at));
        // 调用原始处理函数:
        return _send.apply(res, arguments);
    };
    next();
});

// 自定义异常
global.customError = (status, msg, res) => {
    if (typeof status == 'string') {
        msg = status
        status = null
    }
    var error = new Error(msg || '未知异常')
    error.status = status || 500

    res.send({code: error.status, msg: error.msg})
}

var isDev = process.env.NODE_ENV !== 'production';
app.locals.env = process.env.NODE_ENV || 'dev';
app.locals.reload = true;

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

if (isDev) {
    console.log('dev-env');
    // static assets served by webpack-dev-middleware & webpack-hot-middleware for development
    var webpack = require('webpack'),
        webpackDevMiddleware = require('webpack-dev-middleware'),
        webpackHotMiddleware = require('webpack-hot-middleware'),
        webpackDevConfig = require('./webpack.config.js');

    var compiler = webpack(webpackDevConfig);

    // attach to the compiler & the server
    app.use(webpackDevMiddleware(compiler, {

        // public path should be the same with webpack config
        publicPath: webpackDevConfig.output.publicPath,
        noInfo: true,
        stats: {
            colors: true
        }
    }));
    app.use(webpackHotMiddleware(compiler));
    // add "reload" to express, see: https://www.npmjs.com/package/reload
    // var reload = require('reload');


    app.use('/', routes);
    app.use('/users', users);
    app.use('/admin', admins);
    app.use('/service', services);

    //catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });


    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res) {
        console.log(req)
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
    paypal.configure({
        'mode': 'sandbox', //sandbox or live
        'client_id': ppconfig.client_id,
        'client_secret': ppconfig.client_secret,
        'grant_type': 'client_credentials',
        'content_type': 'application/x-www-form-urlencoded'
    });

    app.get('/checkout', function (req, res) {
        console.log('-------------------------')
        //build PayPal payment request
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
        };

        async.waterfall([
            function (callback) {
                paypal.generate_token(function (err, token) {
                    if (err) {
                        console.log('generate_token ERROR: ');
                        console.log(err);
                        callback(err);
                    } else {
                        console.log('----------------------------------------------------------');
                        console.log('----------       ACCESS TOKEN RESPONSE          ----------');
                        console.log('----------------------------------------------------------');
                        console.log(JSON.stringify(token));
                        callback(null, token);
                    }
                });
            },
            function (token, callback) {
                console.log('----------------------------------------------------------');
                console.log('----------             CREATE PAYMENT           ----------');
                console.log('----------------------------------------------------------');
                console.log(JSON.stringify(payReq));

                paypal.payment.create(payReq, function (err, response) {
                    if (err) {
                        console.log('create payment ERROR: ');
                        console.log(err);
                        callback(err);
                    } else {
                        console.log('----------------------------------------------------------');
                        console.log('----------     CREATE PAYMENT RESPONSE          ----------');
                        console.log('----------------------------------------------------------');
                        console.log(JSON.stringify(response));

                        var url = response.links[1].href;
                        var tmpAr = url.split('EC-');
                        var token = {};
                        token.redirectUrl = 'https://www.sandbox.paypal.com/checkoutnow?useraction=commit&token=EC-' + tmpAr[1];
                        token.token = 'EC-' + tmpAr[1];
                        console.log('------ Token Split ------');
                        console.log(token);

                        callback(null, token);
                    }
                });
            }], function (err, result) {
            if (err) {
                console.log('An ERROR occured!');
                console.log(err);
                res.json(err);
            } else {
                console.log('----------------------------------------------------------');
                console.log('----------          REDIRECTING USER            ----------');
                console.log('----------------------------------------------------------');
                console.log(result.redirectUrl);
                res.redirect(result.redirectUrl);
            }
        });
    });

    app.get('/return', function (req, res) {
        console.log('----------------------------------------------------------');
        console.log('----------       RETURN WITH QUERY PARAMS       ----------');
        console.log('----------------------------------------------------------');
        console.log(JSON.stringify(req.query));
        console.log('-------------------------')
        paypal.payment.get(req.query.paymentId, function (err, payment) {
            if (err !== null) {
                console.log('ERROR');
                console.log(err);
                res.json(err);
            } else {
                console.log('----------------------------------------------------------');
                console.log('----------             PAYMENT DETAILS          ----------');
                console.log('----------------------------------------------------------');
                console.log(JSON.stringify(payment));
                var execute_details = {'payer_id': payment.payer.payer_info.payer_id};
                paypal.payment.execute(payment.id, execute_details, function (err, response) {
                    if (err !== null) {
                        console.log('ERROR');
                        console.log(err);
                        res.json(err);
                    } else {
                        console.log('----------------------------------------------------------');
                        console.log('----------      PAYMENT COMPLETED DETAILS       ----------');
                        console.log('----------------------------------------------------------');
                        console.log(JSON.stringify(response));
                        var displayData = "ID: " + response.id + "<br />State: " + response.state + "<br />";
                        res.send(displayData);
                    }
                })
            }
        })
    });

    app.get('/cancel', function (req, res) {
        console.log(req.query)
        res.redirect('/');
    });

    var server = https.createServer(app);
    // reload(server, app);

    server.listen(port, function () {
        console.log('App (dev) is now running on port 3000!');
    });

} else {
    app.use(express.static(path.join(__dirname, 'public')));
    // add "reload" to express, see: https://www.npmjs.com/package/reload
    // var reload = require('reload');
    app.use('/', routes);
    app.use('/users', users);
    app.use('/admin', admins);
    app.use('/service', services);

    //catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });


    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res) {
        console.log(req)
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
    paypal.configure({
        'mode': 'sandbox', //sandbox or live
        'client_id': ppconfig.client_id,
        'client_secret': ppconfig.client_secret,
        'grant_type': 'client_credentials',
        'content_type': 'application/x-www-form-urlencoded'
    });

    app.get('/checkout', function (req, res) {
        console.log('-------------------------')
        //build PayPal payment request
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
        };

        async.waterfall([
            function (callback) {
                paypal.generate_token(function (err, token) {
                    if (err) {
                        console.log('generate_token ERROR: ');
                        console.log(err);
                        callback(err);
                    } else {
                        console.log('----------------------------------------------------------');
                        console.log('----------       ACCESS TOKEN RESPONSE          ----------');
                        console.log('----------------------------------------------------------');
                        console.log(JSON.stringify(token));
                        callback(null, token);
                    }
                });
            },
            function (token, callback) {
                console.log('----------------------------------------------------------');
                console.log('----------             CREATE PAYMENT           ----------');
                console.log('----------------------------------------------------------');
                console.log(JSON.stringify(payReq));

                paypal.payment.create(payReq, function (err, response) {
                    if (err) {
                        console.log('create payment ERROR: ');
                        console.log(err);
                        callback(err);
                    } else {
                        console.log('----------------------------------------------------------');
                        console.log('----------     CREATE PAYMENT RESPONSE          ----------');
                        console.log('----------------------------------------------------------');
                        console.log(JSON.stringify(response));

                        var url = response.links[1].href;
                        var tmpAr = url.split('EC-');
                        var token = {};
                        token.redirectUrl = 'https://www.sandbox.paypal.com/checkoutnow?useraction=commit&token=EC-' + tmpAr[1];
                        token.token = 'EC-' + tmpAr[1];
                        console.log('------ Token Split ------');
                        console.log(token);

                        callback(null, token);
                    }
                });
            }], function (err, result) {
            if (err) {
                console.log('An ERROR occured!');
                console.log(err);
                res.json(err);
            } else {
                console.log('----------------------------------------------------------');
                console.log('----------          REDIRECTING USER            ----------');
                console.log('----------------------------------------------------------');
                console.log(result.redirectUrl);
                res.redirect(result.redirectUrl);
            }
        });
    });

    app.get('/return', function (req, res) {
        console.log('----------------------------------------------------------');
        console.log('----------       RETURN WITH QUERY PARAMS       ----------');
        console.log('----------------------------------------------------------');
        console.log(JSON.stringify(req.query));
        console.log('-------------------------')
        paypal.payment.get(req.query.paymentId, function (err, payment) {
            if (err !== null) {
                console.log('ERROR');
                console.log(err);
                res.json(err);
            } else {
                console.log('----------------------------------------------------------');
                console.log('----------             PAYMENT DETAILS          ----------');
                console.log('----------------------------------------------------------');
                console.log(JSON.stringify(payment));
                var execute_details = {'payer_id': payment.payer.payer_info.payer_id};
                paypal.payment.execute(payment.id, execute_details, function (err, response) {
                    if (err !== null) {
                        console.log('ERROR');
                        console.log(err);
                        res.json(err);
                    } else {
                        console.log('----------------------------------------------------------');
                        console.log('----------      PAYMENT COMPLETED DETAILS       ----------');
                        console.log('----------------------------------------------------------');
                        console.log(JSON.stringify(response));
                        var displayData = "ID: " + response.id + "<br />State: " + response.state + "<br />";
                        res.send(displayData);
                    }
                })
            }
        })
    });

    app.get('/cancel', function (req, res) {
        console.log(req.query)
        res.redirect('/');
    });
    app.listen(port, function () {
        console.log('App (production) is now running on port 3000!');
    });
}


module.exports = app;
