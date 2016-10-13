var express = require('express');
var router = express.Router();
var http = require('http').Server(express);
var formidable = require('formidable');
var fs = require('fs');
var crypto = require('crypto');
var db = require('../model/index');


var r = [];
var u = [];
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/doadminlogin', function (req, res, next) {
    // var newpassword = md5(req.body.password)
    // console.log(newpassword);
    var query = {name: req.body.name, password: req.body.password};
    console.log('--------------');
    db.users.find(query, function (err, result) {

        if (err) {
            console.log(err);
            // res.render("404");
        }
        if (result.length == 1) {
            console.log(result[0].nick_name + ":登录成功" + new Date());
            u = result[0];
            res.render('admin/index', {username: result[0].nick_name});
        } else {
            console.log(query.name + ":登录失败" + new Date());
            res.render('room/login', {
                title: r[0].option_value[0].room_name,
                mes: '账号密码错误',
                scji: '$("#ErrTip").text("账号密码错误").show();'
            });
        }
    });
});
module.exports = router;
