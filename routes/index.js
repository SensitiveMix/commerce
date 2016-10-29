var express = require('express');
var router = express.Router();
var db = require('../model/index');
var crypto = require('crypto');
var async = require('async');

var hotLabel = [];
var categoryies = [];
var u = [];

/* GET home page. */
router.get('/', function (req, res, next) {
    async.parallel([
            function (done) {
                db.categorys.find({}, function (err, result) {
                    if (err) res.send('404');
                    categoryies = result;
                    // console.log(result);
                    done(err, result)
                });
            },
            function (done) {
                db.hotLabels.find({}, null, {
                    sort: {
                        add_time: -1
                    }
                }, function (err, labels) {
                    hotLabel = labels;
                    done(err, labels)
                })
            }
        ],
        function (err, results) {
            if (err) {
                done(err)
            } else {
                var category = results[0];
                var labels = results[1];
                res.render('assets/index', {
                    title: 'ECSell',
                    categories: category,
                    hotLabels: labels,
                    user: {nick_name: ''},
                    status: 500
                });
            }
        });


});

router.get('/login', function (req, res, next) {
    async.parallel([
            function (done) {
                db.categorys.find({}, function (err, result) {
                    if (err) res.send('404');
                    categoryies = result;
                    // console.log(result);
                    done(err, result)
                });
            },
            function (done) {
                db.hotLabels.find({}, null, {
                    sort: {
                        add_time: -1
                    }
                }, function (err, labels) {
                    hotLabel = labels;
                    done(err, labels)
                })
            }
        ],
        function (err, results) {
            if (err) {
                done(err)
            } else {
                var category = results[0];
                var labels = results[1];
                res.render('assets/login', {
                    title: 'ECSell',
                    categories: category,
                    hotLabels: labels,
                    user: {nick_name: ''},
                    status: 500
                });
            }
        });
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
            u = result[0];
            console.log(result[0].nick_name + ":登录成功" + new Date());
            // res.send('success');
            console.log(result);
            res.render('assets/index', {user: result[0], status: 200})
        } else {
            console.log(query.name + ":登录失败" + new Date());
            // res.send(500);
            res.render('assets/login', {status: 500, user: null})
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
//前台注册须知界面
router.get('/teamOfUse', function (req, res) {
    db.systems.findOne({}, function (err, system) {
        if (err) {
            res.send(404)
        } else {
            console.log(system);
            res.render('assets/team_of_use', {
                system: system,
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: {nick_name: u.nick_name},
                status: 500
            })
        }
    })

});
//MD5加密
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

module.exports = router;
