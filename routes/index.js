var express = require('express');
var router = express.Router();
var db = require('../model/index');
var crypto = require('crypto');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('assets/index', {title: 'Express'});
});
//获取轮播广告图
router.get('/getBanner', function (req, res) {
    db.banners.find({'type': 'carousel'}, function (err, result) {
        if (err) throw err;
        res.send(result);
    })
});
//获取头部广告图
router.get('/getHeadBanner', function (req, res) {
    db.banners.findOne({'type': 'headBanner'}, function (err, result) {
        if (err) throw err;
        res.send(result);
    })
});
//前台登陆处理
router.post('/dologin', function (req, res) {
    var query = {name: req.body.name, password: md5(req.body.password)};
    db.users.find(query, function (err, result) {
        if (err) {
            console.log(err);
            res.render("404");
        }
        if (result.length == 1) {
            console.log(result[0].nick_name + ":登录成功" + new Date());
            // res.send('success');
            console.log(result);
            res.render('assets/index', {user: result[0], status: 'ok'})
        } else {
            console.log(query.name + ":登录失败" + new Date());
            // res.send('failed');
            res.render('assets/index', {status: 'fail'})
        }
    });
});
//前台注册处理
router.post('/doregister', function (req, res) {
    console.log("用户注册" + req.body.email + new Date());
    var user = {
        name: req.body.email,
        password: md5(req.body.password),
        nick_name: req.body.email.toString().substring(0, req.body.email.indexOf('@')),
        level: '10',
        levelName: '会员',
        registerTime: new Date().getTime()
    };

    var robot = new db.users(user);
    robot.save(function (err) {
        if (err) {
            res.end('failed');
            console.log(err);

        } else {
            res.send('success');
        }
    });
});
//MD5加密
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

module.exports = router;
