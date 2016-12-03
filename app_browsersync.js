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
var routes = require('./routes/index');
var users = require('./routes/users');
var admins = require('./routes/admin');
var services = require('./routes/services');
var cheerio = require('cheerio');
var superagent = require('superagent');
var ppconfig = require('./payment/ppconfig/sandbox');
var paypal = require('paypal-rest-sdk');
var async = require('async');
var consolidate = require('consolidate');
var cors = require('cors');
var isDev = process.env.NODE_ENV !== 'production';
var morgan = require('morgan');
var fs = require('fs')
var app = express();
var port = 3000;


var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(allowCrossDomain);
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

app.locals.env = process.env.NODE_ENV || 'dev';
app.locals.reload = false;


if (isDev) {
    var webpack = require('webpack'),
        webpackDevMiddleware = require('webpack-dev-middleware'),
        webpackHotMiddleware = require('webpack-hot-middleware'),
        webpackDevConfig = require('./webpack.config.js');

    var compiler = webpack(webpackDevConfig);

    app.use(webpackDevMiddleware(compiler, {
        publicPath: webpackDevConfig.output.publicPath,
        noInfo: true,
        stats: {
            colors: true
        }
    }));
    app.use(webpackHotMiddleware(compiler));

    app.use('/', routes);
    app.use('/users', users);
    app.use('/admin', admins);
    app.use('/service', services);
    // production error handler

    paypal.configure({
        'mode': 'sandbox', //sandbox or live
        'client_id': ppconfig.client_id,
        'client_secret': ppconfig.client_secret,
        'grant_type': 'client_credentials',
        'content_type': 'application/x-www-form-urlencoded'
    });

    //payment
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

    // browsersync is a nice choice when modifying only views (with their css & js)
    var bs = require('browser-sync').create();
    app.listen(port, function () {
        bs.init({
            open: true,
            ui: false,
            notify: false,
            proxy: 'localhost:3000',
            files: ['./views/**'],
            port: 8080
        });
        console.log('App (dev) is going to be running on port 8080 (by browsersync).');
    });

} else {
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/', routes);
    app.use('/users', users);
    app.use('/admin', admins);
    app.use('/service', services);
    app.listen(port, function () {
        console.log('App (production) is now running on port 3000!');
    });
}
