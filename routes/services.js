/**
 * Created by sunNode on 16/10/17.
 */
var express = require('express');
var router = express.Router();
var http = require('http').Server(express);
var formidable = require('formidable');
var fs = require('fs');
var crypto = require('crypto');
var db = require('../model/index');


var r = [];
var u = [];

//MD5加密
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

//客服后台登录界面
router.get('/', function (req, res) {
    res.render('services/login', {title: '客服后台', mes: ''});
});

//客服后台登录界面
router.get('/servicesLogin', function (req, res) {
    res.render('services/login', {title: '客服后台', mes: ''});
});

//客服后台登陆处理
var checkLogin = function (req, res, next) {
    if (u.length == 0) {
        res.render('services/404', {username: u.nick_name});
    }
    next();
};
router.post('/doServicesLogin', function (req, res, next) {
    var query = {name: req.body.name, password: req.body.password, level: '0'};
    db.users.find(query, function (err, result) {
        if (err) {
            console.log(err);
        }
        if (result.length == 1) {
            console.log(result[0].nick_name + ":登录成功" + new Date());
            u = result[0];
            res.render('services/index', {username: result[0].nick_name});
        } else {
            console.log(query.name + ":登录失败" + new Date());
            res.render('services/login', {
                title: '客服后台',
                mes_info: 'login failed',
                mes: '账号密码错误'
            });
            // res.send('login failed');
        }
    });
});

//跳转页面-基本设置
router.get('/serviceMainSet', checkLogin);
router.get('/serviceMainSet', function (req, res, next) {
    console.log("基本设置页面" + new Date());

    res.render('services/index', {username: u.nick_name});
    console.log("基本设置成功" + u);
});

//订单管理页面-基本设置
router.get('/orderManage', checkLogin);
router.get('/orderManage', function (req, res, next) {
    console.log("基本设置页面" + new Date());

    res.render('services/order_manage', {username: u.nick_name});
    console.log("基本设置成功" + u);
});

//实时聊天页面-基本设置
router.get('/chatOnline', checkLogin);
router.get('/chatOnline', function (req, res, next) {
    console.log("实时聊天设置页面" + new Date());
    res.render('services/chat_manage', {username: u.nick_name});
});


module.exports = router;