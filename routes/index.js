var express = require('express');
var router = express.Router();
var db = require('../model/index');
var crypto = require('crypto');
var async = require('async');
var _ = require('lodash');

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
                var account = null;
                var statusCode = 500;
                if (req.cookies["account"] != null) {
                    account = req.cookies['account'];
                    statusCode = 200;
                }
                res.render('assets/index', {
                    title: 'ECSell',
                    url: '/',
                    categories: category,
                    hotLabels: labels,
                    user: account,
                    status: statusCode
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
                var account = null;
                var statusCode = 500;
                console.log(category);
                if (req.cookies["account"] != null) {
                    account = req.cookies['account'];
                    statusCode = 200;
                }
                res.render('assets/login', {
                    title: 'ECSell',
                    categories: category,
                    hotLabels: labels,
                    user: account,
                    status: statusCode
                });
            }
        });
});

//登出处理
router.get('/logout', function (req, res, next) {
    res.clearCookie("account");
    res.redirect('/login');
});
//验证邮件
router.post('/validateEmail', function (req, res, next) {
    db.users.find({name: req.body.email}, function (err, result) {
        if (err) {
            res.end('500')
        } else {
            if (result.length > 0) {
                res.send('401');  //email has exist
            } else {
                res.send('200');
            }
        }
    })
});
//person center
router.get('/personal-center', function (req, res, next) {
    var statusCode = null;
    if (req.cookies["account"] != null) {
        statusCode = 200;
    } else {
        statusCode = 500;
    }
    console.log(req.cookies["account"]);
    res.render('assets/Personal-Center', {
        title: 'ECSell',
        categories: categoryies,
        hotLabels: hotLabel,
        user: req.cookies['account'],
        status: statusCode
    })
});

router.post('/change-profile', function (req, res, next) {
    console.log(req.body);
    db.users.update({"nick_name": req.body.origin_nick_name}, {
        $set: {
            nick_name: req.body.new_nick_name,
            company: req.body.customers_company,
            sex: req.body.gender
        }
    }, function (err, result) {
        if (err) {
            res.send(404)
        } else {
            var changeCode = null;
            var statusCode = null;
            if (result.nModified == 0) {
                res.send({account: '', code: 500, msg: 'CHANGE FAILED'})
            } else {
                if (req.cookies["account"] != null) {
                    var name = req.cookies["account"].name;
                    res.clearCookie("account");
                    res.cookie("account", {
                        name: name,
                        nick_name: req.body.new_nick_name,
                        company: req.body.customers_company,
                        sex: req.body.gender
                    })
                    req.cookies["account"].name = name;
                    req.cookies["account"].nick_name = req.body.new_nick_name;
                    req.cookies["account"].company = req.body.customers_company;
                    req.cookies["account"].sex = req.body.gender;
                    res.send({account: req.cookies["account"], code: 200, msg: 'SUCCESS'})
                } else {
                    res.send({account: '', code: 500, msg: 'Not LOGIN'})
                }
            }

        }
    })
});

router.post('/change-email', function (req, res, next) {
    console.log(req.body);
    db.users.update({name: req.body.old_name, password: md5(req.body.existing_password)}, {
        $set: {
            name: req.body.newEmail
        }
    }, function (err, result) {
        if (err) {
            res.send(404)
        } else {
            console.log(result);
            var changeCode = null;
            if (result.nModified == 0) {
                res.send({account: '', code: 500, msg: 'CHANGE FAILED'})
            } else {
                if (req.cookies["account"] != null) {
                    var name = req.body.newEmail;
                    var nick_name = req.cookies["account"].nick_name;
                    var company = req.cookies["account"].company;
                    res.clearCookie("account");
                    res.cookie("account", {
                        name: name,
                        nick_name: nick_name,
                        company: company,
                        sex: req.body.gender
                    });
                    req.cookies["account"].name = req.body.newEmail;
                    console.log(req.cookies["account"]);
                    res.send({account: req.cookies["account"], code: 200, msg: 'SUCCESS'})
                } else {
                    res.send({account: '', code: 500, msg: 'Not LOGIN'})
                }
            }
        }
    })
})

router.post('/change-password', function (req, res, next) {
    console.log(req.body);
    db.users.update({name: req.body.old_name, password: md5(req.body.existing_password_1)}, {
        $set: {
            password: md5(req.body.login_password_twice)
        }
    }, function (err, result) {
        if (err) {
            res.send(404)
        } else {
            console.log(result);
            var changeCode = null;
            if (result.nModified == 0) {
                res.send({account: '', code: 500, msg: 'CHANGE FAILED'})
            } else {
                if (req.cookies["account"] != null) {
                    res.send({account: req.cookies["account"], code: 200, msg: 'SUCCESS'})
                } else {
                    res.send({account: '', code: 500, msg: 'Not LOGIN'})
                }
            }
        }
    })
})

router.post('/change-address', function (req, res, next) {
    console.log(req.body);
    db.users.update({name: req.body.name}, {
        $set: {
            areaCode: req.body.areaCode,
            detailAddress: req.body.detail_address
        }
    }, function (err, result) {
        if (err) {
            res.send(404)
        } else {
            console.log(result);
            var changeCode = null;
            if (result.nModified == 0) {
                res.send({account: '', code: 500, msg: 'CHANGE FAILED'})
            } else {
                if (req.cookies["account"] != null) {
                    req.cookies["account"].areaCode = req.body.areaCode;
                    req.cookies["account"].detail_address = req.body.detail_address;
                    res.send({account: req.cookies["account"], code: 200, msg: 'SUCCESS'})
                } else {
                    res.send({account: '', code: 500, msg: 'Not LOGIN'})
                }
            }
        }
    })
})
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
        if (result.length > 0) {
            u = result[0];
            res.cookie("account", {name: result[0].name, nick_name: result[0].nick_name, company: result[0].company})
            console.log(result[0].nick_name + ":登录成功" + new Date());
            db.hotLabels.find({}, null, {
                sort: {
                    add_time: -1
                }
            }, function (err, labels) {
                res.render('assets/index', {
                    user: result[0],
                    categories: categoryies,
                    hotLabels: labels,
                    title: 'ECSell',
                    status: 200
                })
            });
        } else {
            console.log(query.name + ":登录失败" + new Date());
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
        res.end('500')
    });
    res.json('200');
});
//前台注册须知界面
router.get('/team-of-use', function (req, res) {
    db.systems.findOne({}, function (err, system) {
        if (err) {
            res.send(404)
        } else {
            var statusCode = null;
            if (req.cookies["account"] != null) {
                statusCode = 200;
            } else {
                statusCode = 500;
            }
            res.render('assets/team-of-use', {
                system: system,
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies["account"],
                status: statusCode
            })
        }
    })
});
//关于我们界面
router.get('/about-us', function (req, res) {
    db.notices.findOne({}, function (err, system) {
        if (err) {
            res.send(404)
        } else {
            var statusCode = null;
            if (req.cookies["account"] != null) {
                statusCode = 200;
            } else {
                statusCode = 500;
            }
            res.render('assets/about-us', {
                system: system.about_us[0],
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies["account"],
                status: statusCode
            })
        }
    })
});
//Privacy Policy
router.get('/privacy-policy', function (req, res) {
    db.notices.findOne({}, function (err, system) {
        if (err) {
            res.send(404)
        } else {
            var statusCode = null;
            if (req.cookies["account"] != null) {
                statusCode = 200;
            } else {
                statusCode = 500;
            }

            res.render('assets/privacy-notice', {
                system: system.privacy_notice[0],
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies['account'],
                status: statusCode
            })
        }
    })
});
//FAQ
router.get('/FAQ', function (req, res) {
    db.notices.findOne({}, function (err, system) {
        if (err) {
            res.send(404)
        } else {
            var statusCode = null;
            if (req.cookies["account"] != null) {
                statusCode = 200;
            } else {
                statusCode = 500;
            }
            res.render('assets/FAQ', {
                system: system.FAQ[0],
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies['account'],
                status: statusCode
            })
        }
    })
});
//attention
router.get('/attention', function (req, res) {
    db.notices.findOne({}, function (err, system) {
        if (err) {
            res.send(404)
        } else {
            var statusCode = null;
            if (req.cookies["account"] != null) {
                statusCode = 200;
            } else {
                statusCode = 500;
            }
            res.render('assets/attention', {
                system: system.attention[0],
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies['account'],
                status: statusCode
            })
        }
    })
});
//connect_us
router.get('/contact-us', function (req, res) {
    db.notices.findOne({}, function (err, system) {
        if (err) {
            res.send(404)
        } else {
            var statusCode = null;
            if (req.cookies["account"] != null) {
                statusCode = 200;
            } else {
                statusCode = 500;
            }
            res.render('assets/contact-us', {
                system: system.contact_us[0],
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies['account'],
                status: statusCode
            })
        }
    })
});

router.get('/product/:id', function (req, res, next) {
    db.categorys.findOne({
        'secondCategory.thirdTitles.thirdUrl': '/product/' + req.params["id"]
    }, function (err, result) {
        var arr = [];
        var secondParam = {};
        _.each(result.secondCategory, function (second) {
            var newArr = _.filter(second.thirdTitles, function (third) {
                secondParam.secondTitle = second.secondTitle;
                secondParam.secondUrl = second.secondUrl;
                return third.thirdUrl == '/product/' + req.params["id"]
            });
            arr = _.concat(newArr, arr)
        });
        console.log(secondParam);
        if (arr.length == 0) {
            res.render('assets/product-detail', {
                product: [],
                secondCategory: secondParam,
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies['account'],
                status: 200,
                errorCode: 500,
                msg: 'NOT FOUND'
            })
        } else {
            console.log(arr)
            res.render('assets/product-detail', {
                product: arr,
                secondCategory: secondParam,
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies['account'],
                status: 200
            })
        }
    })
});

router.get('/single-product/:id', function (req, res, next) {
    db.categorys.findOne({
        'secondCategory.thirdTitles.product.product_id': req.params["id"]
    }, function (err, result) {
        var arr = [];
        _.each(result.secondCategory, function (second) {
            _.each(second.thirdTitles, function (third) {
                var newArr = _.filter(third.product, function (four) {
                    return four.product_id == req.params["id"]

                });
                arr = _.concat(newArr, arr)
            });

        });
        console.log(arr);
        if (arr.length == 0) {
            res.render('assets/single-product-detail', {
                product: [],
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies['account'],
                status: 200,
                errorCode: 500,
                msg: 'NOT FOUND'
            })
        } else {
            console.log(arr)
            res.render('assets/single-product-detail', {
                product: arr,
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies['account'],
                status: 200
            })
        }
    })
});

//一级类目查找
router.get('/products/:category/:id', function (req, res, next) {
    db.categorys.find({
        'firstUrl': '/products/' + req.params["category"] + '/' + req.params["id"]
    }, function (err, result) {
        var secondCategory = result[0].secondCategory;
        console.log(secondCategory);
        if (secondCategory.length == 0) {
            res.render('assets/first-product', {
                product: [],
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies['account'],
                status: 200,
                errorCode: 500,
                msg: 'NOT FOUND'
            })
        } else {
            res.render('assets/first-product', {
                product: secondCategory,
                title: 'ECSell',
                categories: categoryies,
                hotLabels: hotLabel,
                user: req.cookies['account'],
                status: 200
            })
        }
    })
});

//二级类目查找
router.get('/product/:category/:id', function (req, res, next) {
    console.log(req.params["category"])
    console.log(req.params["id"])
    db.categorys.findOne({
        'secondCategory.secondUrl': '/product/' + req.params["category"] + '/' + req.params["id"]
    }, function (err, data) {

        var arr = [];
        var newArr = _.filter(data.secondCategory, function (second) {
            return second.secondUrl == '/product/' + req.params["category"] + '/' + req.params["id"]
        });
        console.log(data)
        _.concat(newArr, arr);
        console.log(arr);

        res.render('assets/second-product', {
            product: data.secondCategory,
            title: 'ECSell',
            categories: categoryies,
            hotLabels: hotLabel,
            user: req.cookies['account'],
            status: 200
        })

        // if (arr.length == 0) {
        //     res.render('assets/second-product', {
        //         product: [],
        //         title: 'ECSell',
        //         categories: categoryies,
        //         hotLabels: hotLabel,
        //         user: req.cookies['account'],
        //         status: 200,
        //         errorCode: 500,
        //         msg: 'NOT FOUND'
        //     })
        // } else {

        // }

    })
});


//MD5加密
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

module.exports = router;