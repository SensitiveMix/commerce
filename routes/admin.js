var express = require('express');
var router = express.Router();
var http = require('http').Server(express);
var formidable = require('formidable');
var fs = require('fs');
var crypto = require('crypto');
var db = require('../model/index');
var async = require('async');
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var upload = multer({dest: './tmp'});
var superagent = require('superagent');
var cheerio = require('cheerio');
var http_origin = require('http');
var _ = require('lodash');
var path = require('path');
var config = require('../config')

var r = [];
var u = [];
var leverlist = [];
var systems = [];
var tempCategory = [];
/*-------------------------------------------------------------------*/
/* -------------------------实用工具 ---------------------------------*/
//MD5加密
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}
//验证登录
var checkLogin = function (req, res, next) {
    console.log(req);
    if (req.body.status != 'test') {
        if (u.length == 0) {
            res.render('admin/404', {username: u.nick_name});
        }
    }
    next();
};

/*-------------------------------------------------------------------*/
/* -----------------------管理员登录 ---------------------------------*/
//后台登录界面
router.get('/', function (req, res) {
    res.render('admin/login_1', {title: '电商网站后台'});
});

//默认路径
router.get('', function (req, res) {
    res.render('admin/login_1', {title: '电商网站后台'});
});

//进入主页
router.get('/main', function (req, res) {
    res.render('admin/land_page', {username: u.nick_name});
});

//后台登录界面
router.get('/adminlogin', function (req, res) {
    res.render('admin/login_1', {title: '电商网站后台'});
});


//后台登陆处理
router.post('/doadminlogin', function (req, res, next) {
    var query = {name: req.body.name, password: req.body.password, level: '66'};
    async.parallel([
            function (done) {
                db.users.find(query, function (err, users) {
                    if (err) {
                        console.log(err);

                    }
                    done(err, users)
                });
            },
            function (done) {
                db.systems.findOne({}, null, {
                    sort: {
                        'updateTime': -1
                    }
                }, function (err, system_info) {
                    done(err, system_info)
                })
            }
        ],
        function (err, results) {
            if (err) {
                done(err)
            } else {
                var user = results[0];
                var system = results[1];
                console.log(user);
                console.log(system);
                systems = system;
                if (user.length == 1) {
                    console.log(user.nick_name + ":登录成功" + new Date());
                    u = user[0];
                    res.render('admin/land_page', {username: u.nick_name, system: system});
                } else {
                    console.log(query.name + ":登录失败" + new Date());
                    res.render('admin/login_1', {
                        mes_info: 'login failed',
                        mes: '账号密码错误'
                    });
                    // res.send('login failed');
                }
            }
        });
});

//跳转页面-基本设置
router.get('/mainset', checkLogin);
router.get('/mainset', function (req, res, next) {
    console.log("基本设置页面" + new Date());

    db.systems.findOne({}, null, {
        sort: {
            'updateTime': -1
        }
    }, function (err, system_info) {
        res.render('admin/index', {username: u.nick_name, system: system_info});
        console.log("基本设置成功" + u);
    })

});

/*-------------------------------------------------------------------*/
/* -----------------------------用户管理 ----------------------------*/
//获取用户
router.get('/douserlist', function (req, res, next) {
    console.log("当前分页" + req.query.iDisplayStart);
    db.users.find({}, null, {
        sort: {
            'registerTime': 1
        }
    }, function (err, result) {
        var lista = {
            "draw": 2,
            "recordsTotal": "",
            "recordsFiltered": "",
            "data": []
        };
        lista.recordsTotal = result.length;
        lista.recordsFiltered = lista.recordsTotal;
        lista.data = result;
        // console.log(result);
        res.send(lista);
        res.end();
    });

});
//用户管理
router.get('/usermanage', checkLogin);
router.get('/usermanage', function (req, res, next) {
    console.log("用户管理" + new Date());
    async.parallel([
            function (done) {
                db.users.find({}, function (err, users) {
                    if (err) {
                        console.log(err);
                    }
                    done(err, users)
                });
            },
            function (done) {
                db.levels.find({},
                    function (err, levels) {
                        console.log(levels)
                        leverlist = levels[0].level;
                        done(err, levels)
                    })
            }
        ],
        function (err, results) {
            if (err) {
                done(err)
            } else {
                var user = results[0];
                var level = results[1];
                // console.log(user);
                console.log(leverlist);
                if (user.length > 1) {
                    console.log("用户管理页面登陆成功");
                    res.render('admin/user_manage', {users: user, username: u.nick_name, lvlist: leverlist});
                } else {
                    res.render('admin/login_1', {
                        mes_info: 'login failed',
                        mes: '账号密码错误'
                    });
                }
            }
        }
    )
});
//删除用户
router.post('/doDelUer', checkLogin);
router.post('/doDelUer', function (req, res, next) {
    console.log("用户删除" + new Date());
    console.log(req.body.user_id)
    db.users.remove({_id: req.body.user_id}, function (err) {
        if (err) {
            res.send({"error_msg": ['ERROR'], "info": "", "result": "fail", "code": "500"})
        }
        res.send({"error_msg": [], "info": "", "result": "success", "code": "200"})
    });
});

//添加用户
router.post('/doAddUser', checkLogin);
router.post('/doAddUser', function (req, res, next) {
    console.log("用户添加" + req.body.addName + new Date());
    var date = Date();
    var doc = {
        name: req.body.addname,
        password: md5(req.body.addpassword),
        nick_name: req.body.addnickname,
        level: req.body.addLevel,
        levelName: req.body.addLevelName,
        registerTime: req.body.registerTime
    };
    var robot = new db.users(doc);
    robot.save(function (err) {
        if (err) // ...
            console.log('meow');
        res.end();
    });
});

//修改用户
router.post('/doChangeUser', checkLogin);
router.post('/doChangeUser', function (req, res, next) {
    console.log("用户修改" + new Date());
    var newPassword;
    if (req.body.addpassword == '********') {
        newPassword = req.body.oldPassword;
    } else {
        newPassword = md5(req.body.addpassword);
    }
    console.log(req.body);
    db.users.update({_id: req.body.id}, {
        $set: {
            name: req.body.addname,
            password: newPassword,
            nick_name: req.body.addnickname,
            level: req.body.addLevel,
            levelName: req.body.addLevelName
        }

    }, function (err) {
        res.end();
    });
});

/*-------------------------------------------------------------------*/
/* -----------------------------商城前台管理 -------------------------*/
//上传文件接口
router.post('/doupload', function (req, res) {
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = '/Users/sunNode/WebstormProjects/e-commerce-platform/public' + '/upload/';	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
    form.parse(req, function (err, fields, files) {

        if (err) {
            res.locals.error = err;
            res.end();
            return;
        }

        var extName = '';  //后缀名
        switch (files.fulAvatar.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }

        if (extName.length == 0) {
            res.locals.error = '只支持png和jpg格式图片';
            res.end();
            return;
        }

        var avatarName = Math.random() + '.' + extName;
        var newPath = form.uploadDir + avatarName;
        var savePath = '/upload/' + avatarName;
        res.json(savePath);
        res.end();
        console.log(savePath);
        fs.renameSync(files.fulAvatar.path, newPath);  //重命名
    });

    res.locals.success = '上传成功';
});

//首页轮播图片管理
router.get('/banner_manage', checkLogin);
router.get('/banner_manage', function (req, res, next) {
    console.log("图片轮播管理页面" + new Date());

    res.render('admin/banner_manage', {username: u.nick_name});
    console.log("页面访问成功");
});

//更改注册须知
router.post('/doChangeConditions', checkLogin);
router.post('/doChangeConditions', function (req, res) {
    console.log("更改注册须知" + req.body.mainContent + new Date());
    db.systems.update({name: 'register_need_know'}, {$set: {mainContent: req.body.mainContent}}, function (err, system) {
        if (err) {
            res.send('failed');
        } else {
            res.send('success');
        }

    })
});

//上传产品
// router.get('/upload', checkLogin);
// router.get('/upload', function (req, res) {
//     db.categorys.find({}, function (err, category) {
//         if (err) res.send('404');
//         db.uploadTemporarys.find({}, null, {
//             sort: {
//                 upload_time: -1
//             }
//         }, function (err, result) {
//             if (err) {
//                 res.render({
//                     error_msg: ['INTERNAL SERVER ERROR'],
//                     info: "",
//                     result: "fail",
//                     code: "500",
//                     username: u.nick_name,
//                     upload: [],
//                     category: category
//                 });
//             } else {
//                 res.render('admin/upload_goods', {
//                     error_msg: [],
//                     info: result,
//                     result: "success",
//                     code: "200",
//                     username: u.nick_name,
//                     upload: [],
//                     category: category
//                 });
//             }
//
//         }).limit(5);
//     });
//
// });

//首页轮播图片替换
router.post('/saveBanners', checkLogin);
router.post('/saveBanners', function (req, res) {
    console.log("Banners 添加" + req.body.image_url + new Date());
    var banner = {
        image_url: req.body.image_url,
        upload_time: req.body.upload_time,
        status: req.body.status,
        type: req.body.type
    };
    var banners = new db.banners(banner);
    banners.save(function (err) {
        if (err) {
            console.log('添加失败');
            res.send('fail')
        } else {
            res.send('success');
        }

    });
});

//首页头部广告管理
router.get('/head_banner_manage', checkLogin);
router.get('/head_banner_manage', function (req, res, next) {
    console.log("头部广告轮播管理页面" + new Date());
    db.banners.find({'type': 'headBanner'}, function (err, result) {
        if (err) throw  err;
        console.log('-------------');
        console.log(result);
        res.render('admin/head_banner_manage', {image_url: result[0], username: u.nick_name});
    });
    console.log("头部广告轮播管理页面访问成功");
});

//首页头部广告替换
router.post('/saveHeadBanners', checkLogin);
router.post('/saveHeadBanners', function (req, res) {
    console.log("Head Banners add" + req.body.image_url + new Date());
    var banner = {
        image_url: req.body.image_url,
        upload_time: req.body.upload_time,
        status: req.body.status,
        type: req.body.type
    };
    var banners = new db.banners(banner);
    banners.save(function (err) {
        if (err) {
            res.send('fail')
        } else {
            res.send('success');
        }

    });
});


//更改注册须知
router.post('/doChangeConditions', checkLogin);
router.post('/doChangeConditions', function (req, res) {
    console.log("更改注册须知" + req.body.mainContent + new Date());
    db.systems.update({name: 'register_need_know'}, {$set: {mainContent: req.body.mainContent}}, function (err, system) {
        if (err) {
            res.send('failed');
        } else {
            res.send('success');
        }

    })
});

//关于我们管理页面
router.get('/about_us', checkLogin);
router.get('/about_us', function (req, res, next) {
    console.log("关于我们管理" + new Date());
    db.notices.findOne({}, function (err, allNotices) {
        console.log(allNotices);
        res.render('admin/notices/about_us', {aboutUs: allNotices.about_us, username: u.nick_name});
    });
    console.log("关于我们管理");
});

//更改我们管理页面
router.post('/doChangeAboutUs', checkLogin);
router.post('/doChangeAboutUs', function (req, res) {
    console.log("更改注册须知" + req.body.mainContent + new Date());
    db.notices.findOneAndUpdate({}, {
        $set: {
            about_us: [{
                main_content: req.body.mainContent,
                add_time: new Date().getTime(),
                addBy: u.nick_name
            }]
        }
    }, function (err, aboutUs) {
        if (err) {
            res.send('failed');
        } else {
            res.send('success');
        }
    })
});

//联系我们管理页面
router.get('/contact_us', checkLogin);
router.get('/contact_us', function (req, res, next) {
    console.log("关于我们管理" + new Date());
    db.notices.findOne({}, function (err, allNotices) {
        res.render('admin/notices/contact_us', {contactUs: allNotices.contact_us, username: u.nick_name});
    });
    console.log("关于我们管理");
});

//更改联系我们管理页面
router.post('/doChangeContactUs', checkLogin);
router.post('/doChangeContactUs', function (req, res) {
    console.log("更改注册须知" + req.body.mainContent + new Date());
    db.notices.findOneAndUpdate({}, {
        $set: {
            contact_us: [{
                main_content: req.body.mainContent,
                add_time: new Date().getTime(),
                addBy: u.nick_name
            }]
        }
    }, function (err, contact) {
        if (err) {
            res.send('failed');
        } else {
            res.send('success');
        }
    })
});

//关于FAQ页面
router.get('/FAQ', checkLogin);
router.get('/FAQ', function (req, res, next) {
    console.log("FAQ管理" + new Date());
    db.notices.findOne({}, function (err, allNotices) {
        res.render('admin/notices/faq', {faq: allNotices.FAQ, username: u.nick_name});
    });
    console.log("关于FAQ");
});

//更改FAQ页面
router.post('/doChangeFAQ', checkLogin);
router.post('/doChangeFAQ', function (req, res) {
    console.log("FAQ须知" + req.body.mainContent + new Date());
    db.notices.findOneAndUpdate({}, {
        $set: {
            FAQ: [{
                main_content: req.body.mainContent,
                add_time: new Date().getTime(),
                addBy: u.nick_name
            }]
        }
    }, function (err, aboutUs) {
        if (err) {
            res.send('failed');
        } else {
            res.send('success');
        }
    })
});

//关于attention页面
router.get('/attention', checkLogin);
router.get('/attention', function (req, res, next) {
    console.log("attention管理" + new Date());
    db.notices.findOne({}, function (err, allNotices) {
        res.render('admin/notices/attention', {attention: allNotices.attention, username: u.nick_name});
    });
    console.log("关于attention");
});

//更改attention页面
router.post('/doChangeAttention', checkLogin);
router.post('/doChangeAttention', function (req, res) {
    console.log("Attention须知" + req.body.mainContent + new Date());
    db.notices.findOneAndUpdate({}, {
        $set: {
            attention: [{
                main_content: req.body.mainContent,
                add_time: new Date().getTime(),
                addBy: u.nick_name
            }]
        }
    }, function (err, attention) {
        if (err) {
            res.send('failed');
        } else {
            res.send('success');
        }
    })
});

//关于privacy页面
router.get('/privacy', checkLogin);
router.get('/privacy', function (req, res, next) {
    console.log("FAQ管理" + new Date());
    db.notices.findOne({}, function (err, allNotices) {
        res.render('admin/notices/privacy', {privacy: allNotices.privacy_notice, username: u.nick_name});
    });
    console.log("关于FAQ");
});

//更改privacy页面
router.post('/doChangePrivacy', checkLogin);
router.post('/doChangePrivacy', function (req, res) {
    console.log("Privacy须知" + req.body.mainContent + new Date());
    db.notices.findOneAndUpdate({}, {
        $set: {
            privacy_notice: [{
                main_content: req.body.mainContent,
                add_time: new Date().getTime(),
                addBy: u.nick_name
            }]
        }
    }, function (err, privacy) {
        if (err) {
            res.send('failed');
        } else {
            res.send('success');
        }
    })
});

//最热产品管理
router.get('/hot_product_manage', checkLogin);
router.get('/hot_product_manage', function (req, res, next) {
    console.log("最热产品管理" + new Date());
    db.users.find({}, function (err, result) {
        if (err) throw  err;
        res.render('admin/hot_product_manage', {users: result, username: u.nick_name});
    });
    console.log("用户管理页面登陆成功");
});

/* ----------------------------类目管理 -------------------------*/
//类目管理
router.get('/accessory_manage', checkLogin);
router.get('/accessory_manage', function (req, res, next) {
    console.log("类目管理" + new Date());
    res.render('admin/accessory_manage', {upload: [], username: u.nick_name});
    // db.users.find({}, function (err, result) {
    //     if (err) throw  err;
    //
    // });
    console.log("类目管理页面登陆成功");
});

//类目上传
router.post('/doAddCategory', checkLogin);
router.post('/doAddCategory', function (req, res) {
    console.log(req.body);
    console.log(JSON.parse(req.body.secondCategory));

    var Categories = {
        firstCategory: req.body.firstCategory,
        firstUrl: req.body.firstUrl,
        firstCount: req.body.firstCount,
        secondCategory: JSON.parse(req.body.secondCategory)
    };
    var category = new db.categorys(Categories);
    category.save(function (err) {
        console.log(err);
        if (err) {
            res.send('fail')
        } else {
            res.send('success');
        }
    });
});

/*-------------------------------------------------------------------*/
/* ----------------------------上传产品模块 -------------------------*/

//上传产品
router.get('/upload', checkLogin);
router.get('/upload', function (req, res) {
    db.categorys.find({}, function (err, result) {
        if (err) res.send('404');
        console.log(result);
        res.render('admin/upload_goods', {username: u.nick_name, upload: [], category: result});
    });

});

//上传产品详细信息
router.get('/upload-products-detail', function (req, res) {
    async.parallel([
            function (done) {
                db.categorys.find({}, function (err, result) {
                    if (err) res.send('404');
                    done(err, result)
                });

            },
            function (done) {
                db.specifications.find({}, function (err, product_spectication) {
                    done(err, product_spectication)
                });
            },
            function (done) {
                db.suppliers.find({}, function (err, suppliers) {
                    done(err, suppliers)
                });
            }
        ],
        function (err, results) {
            if (err) {
                done(err)
            } else {
                var categorys = results[0];
                var product_spectication = results[1];
                var suppliers = results[2];
                var compatibility = [],
                    type = [],
                    hardOrSoft = [],
                    features = [],
                    pattern = [],
                    Color = [],
                    material = [];
                _.each(tempCategory, function (item) {
                    if (item.thirdCategory != '') {
                        var compatibilityArr = filterArr(product_spectication[0].compatibility, item.thirdCategory);
                        compatibility = _.concat(compatibility, compatibilityArr)

                        var typeArr = filterArr(product_spectication[0].type, item.thirdCategory)
                        type = _.concat(type, typeArr)

                        var hardOrSoftArr = filterArr(product_spectication[0].hardOrSoft, item.thirdCategory);
                        hardOrSoft = _.concat(hardOrSoft, hardOrSoftArr)

                        var featuresArr = filterArr(product_spectication[0].features, item.thirdCategory)
                        features = _.concat(features, featuresArr)

                        var patternArr = filterArr(product_spectication[0].pattern, item.thirdCategory)
                        pattern = _.concat(pattern, patternArr)

                        var ColorArr = filterArr(product_spectication[0].Color, item.thirdCategory);
                        Color = _.concat(Color, ColorArr)

                        var materialArr = filterArr(product_spectication[0].material, item.thirdCategory)
                        material = _.concat(material, materialArr)
                    }
                });
                console.log(suppliers);
                res.render('admin/upload-products-detail', {
                    username: u.nick_name,
                    upload: [],
                    category: categorys,
                    tempCategory: tempCategory,
                    suppliers: suppliers,
                    product_specification: {
                        compatibility: compatibility,
                        type: type,
                        hardOrSoft: hardOrSoft,
                        features: features,
                        pattern: pattern,
                        Color: Color,
                        material: material
                    }
                });
                tempCategory = [];
            }
        });


});

function filterArr(spectication, tempCategory) {
    var newArr = _.filter(spectication, function (compatibility) {
        return tempCategory == compatibility.belong;
    });
    return newArr;
}

//类目管理
router.get('/accessory_manage', checkLogin);
router.get('/accessory_manage', function (req, res, next) {
    console.log("类目管理" + new Date());
    res.render('admin/accessory_manage', {upload: [], username: u.nick_name});
    // db.users.find({}, function (err, result) {
    //     if (err) throw  err;
    //
    // });
    console.log("类目管理页面登陆成功");
});

//类目上传
router.post('/doAddCategory', checkLogin);
router.post('/doAddCategory', function (req, res) {
    console.log(req.body.firstCategory);
    console.log(JSON.parse(req.body.secondCategory));

    var Categories = {
        firstCategory: req.body.firstCategory,
        firstUrl: req.body.firstUrl,
        firstCount: req.body.firstCount,
        secondCategory: JSON.parse(req.body.secondCategory)
    };
    var category = new db.categorys(Categories);
    category.save(function (err) {
        console.log(err);
        if (err) {
            res.send('fail')
        } else {
            res.send('success');
        }
    });
});

//进入产品页面GET所以收藏类目
router.get('/uploadTemporary', function (req, res, next) {
    db.uploadTemporarys.find({'addBy': req.query.username}, null, {
        sort: {
            upload_time: -1
        }
    }, function (err, result) {
        if (err) {
            res.send({error_msg: ['INTERNAL SERVER ERROR'], info: "", result: "fail", code: "500"});
        } else {
            console.log('get ')
            res.send({error_msg: [], info: result, result: "success", code: "200"});
        }

    }).limit(5);
})

//产品页面POST保存最近上传类目接口
router.post('/uploadTemporary', function (req, res, next) {

    if (req.body.firstCategory == '' && req.body.secondCategory != '') {
        res.send({error_msg: ['FORMAT PARAM Error'], info: "", result: "fail", code: "400"})
    } else {
        var Categories = {
                firstCategory: req.body.firstCategory,
                secondCategory: req.body.secondCategory,
                thirdCategory: req.body.thirdCategory,
                addBy: req.body.addBy,
                upload_time: (new Date().getTime() / 1000).toFixed(),
                status: 'NEW'
            }
            ;
        tempCategory.push(Categories);
        var category = new db.uploadTemporarys(Categories);
        category.save(function (err) {
            console.log(err);
            if (err) {
                console.log(err);
                res.send({error_msg: ['INTERNAL SERVER ERROR'], info: "", result: "fail", code: "500"})
            } else {
                db.uploadTemporarys.find({'addBy': req.body.addBy}, null, {
                    sort: {
                        upload_time: -1
                    }
                }, function (err, result) {
                    if (err) {
                        res.send({error_msg: ['INTERNAL SERVER ERROR'], info: "", result: "fail", code: "500"});
                    } else {
                        res.send({error_msg: [], info: result, result: "success", code: "200"});
                    }

                }).limit(5);

            }
        });
    }

});


/*-------------------------------------------------------------------*/
/*----------------------------产品基本信息管理-------------------------*/
//产品基本信息录入管理
router.get('/specification', checkLogin);
router.get('/specification', function (req, res, next) {
    console.log("产品上传管理" + new Date());
    db.specifications.find({}, function (err, result) {
        db.categorys.find({}, function (err, data) {
            if (err) res.send('404');
            res.render('admin/specifications_manage',
                {
                    username: u.nick_name,
                    category: data,
                    specifications: result[0]
                }
            );
        });
    })

    console.log("产品上传管理登陆成功");
});

//产品基本信息录入管理-添加属性
router.post('/doAddProperty', function (req, res, next) {
    switch (req.body.addProperty) {
        case 'compatibility':
            db.specifications.update({}, {
                $pushAll: {'compatibility': [{name: req.body.property, belong: req.body.belong}]}
            }, function (err, result) {
                if (err) res.send('500')
                res.send('200')
            });
            break;
        case 'type':
            db.specifications.update({}, {
                $pushAll: {'type': [{name: req.body.property, belong: req.body.belong}]}
            }, function (err, result) {
                if (err) res.send('500')
                res.send('200')
            });
            break;
        case 'hardOrSoft':
            db.specifications.update({}, {
                $pushAll: {'hardOrSoft': [{name: req.body.property, belong: req.body.belong}]}
            });
            break;
        case 'features':
            db.specifications.update({}, {
                $pushAll: {'features': [{name: req.body.property, belong: req.body.belong}]}
            }, function (err, result) {
                if (err) res.send('500')
                res.send('200')
            });
            break;
        case 'pattern':
            db.specifications.update({}, {
                $pushAll: {'pattern': [{name: req.body.property, belong: req.body.belong}]}
            }, function (err, result) {
                if (err) res.send('500')
                res.send('200')
            });
            break;
        case 'Color':
            db.specifications.update({}, {
                $pushAll: {'Color': [{name: req.body.property, belong: req.body.belong}]}
            }, function (err, result) {
                if (err) res.send('500')
                res.send('200')
            });
            break;
        case 'material':
            db.specifications.update({}, {
                $pushAll: {'material': [{name: req.body.property, belong: req.body.belong}]}
            }, function (err, result) {
                if (err) res.send('500')
                res.send('200')
            });
            break;
    }
});

//产品基本信息录入管理-删除属性
router.post('/doDelProperty', function (req, res, next) {
    console.log(req.body);
    switch (req.body.addProperty) {
        case 'compatibility':
            db.specifications.update({}, {
                $pull: {'compatibility': {name: req.body.property, belong: req.body.belong}}
            }, function (err, result) {
                if (err) res.send('500');
                res.send('200')
            });
            break;
        case 'type':
            db.specifications.update({}, {
                $pull: {'type': {name: req.body.property, belong: req.body.belong}}
            }, function (err, result) {
                if (err) res.send('500');
                res.send('200')
            });
            break;
        case 'hardOrSoft':
            db.specifications.update({}, {
                $pull: {'hardOrSoft': {name: req.body.property, belong: req.body.belong}}
            }, function (err, result) {
                if (err) res.send('500');
                res.send('200')
            });
            break;
        case 'features':
            db.specifications.update({}, {
                $pull: {'features': {name: req.body.property, belong: req.body.belong}}
            }, function (err, result) {
                if (err) res.send('500');
                res.send('200')
            });
            break;
        case 'pattern':
            db.specifications.update({}, {
                $pull: {'pattern': {name: req.body.property, belong: req.body.belong}}
            }, function (err, result) {
                if (err) res.send('500');
                res.send('200')
            });
            break;
        case 'Color':
            db.specifications.update({}, {
                $pull: {'Color': {name: req.body.property, belong: req.body.belong}}
            }, function (err, result) {
                if (err) res.send('500');
                res.send('200')
            });
            break;
        case 'material':
            db.specifications.update({}, {
                $pull: {'material': {name: req.body.property, belong: req.body.belong}}
            }, function (err, result) {
                if (err) res.send('500');
                res.send('200')
            });
            break;
    }
});

//点击上传产品跳转到产品详情页接口
router.post('/uploadProductDetail', function (req, res, next) {
    var Categories = [];
    _.each(req.body, function (product) {
        if (product.firstCategory == '' && product.secondCategory != '') {
            res.send({error_msg: ['FORMAT PARAM Error'], info: "", result: "fail", code: "400", username: u.nick_name})
        } else {
            var singleCategories = {
                firstCategory: product.firstCategory,
                secondCategory: product.secondCategory,
                thirdCategory: product.thirdCategory,
                addBy: u.nick_name,
                status: 'NEW'
            };
            Categories.push(singleCategories);
        }
    });

    db.specifications.find({}, function (err, product_spectication) {
        console.log(product_spectication);
        if (Categories.length != 0 && product_spectication.length != 0) {
            console.log({categories: Categories, product_specification: product_spectication})
            res.render('admin/upload-products-detail', {
                error_msg: [],
                info: {categories: Categories, product_specification: product_spectication},
                result: "success",
                code: "200",
                username: u.nick_name
            });
        } else {
            res.send({error_msg: ['FORMAT PARAM Error'], info: "", result: "fail", code: "400", username: u.nick_name})
        }
    });
});

//保存详细产品
router.post('/saveProductDetail', function (req, res, next) {
    console.log(req.body.product);
    console.log(req.body.product.belong_category);
    _.each(req.body.product.belong_category, function (single_category) {
        db.categorys.update({
                'secondCategory.thirdTitles.thirdTitle': {
                    '$in': [single_category.third]
                },
                'secondCategory.secondTitle': {
                    '$in': [single_category.second]
                },
                'firstCategory': single_category.first
            }, {
                $pushAll: {
                    'secondCategory.thirdTitles.product': req.body.product
                }
            },
            function (err, result) {
                console.log(result)
            })
    })
});


/*-------------------------------------------------------------------*/
/*----------------------------供应商管理------------------------------*/
//获取供应商
router.get('/supplierList', function (req, res, next) {
    console.log("当前分页" + req.query.iDisplayStart);
    db.suppliers.find({}, null, {
        sort: {
            'add_time_number': 1
        }
    }, function (err, result) {
        var lista = {
            "draw": 2,
            "recordsTotal": "",
            "recordsFiltered": "",
            "data": []
        };
        lista.recordsTotal = result.length;
        lista.recordsFiltered = lista.recordsTotal;
        lista.data = result;
        res.send(lista);
        res.end();
    });

});
router.post('/doAddSupplier', checkLogin);
router.get('/supplier_manage', function (req, res, next) {
    res.render('admin/supplier_manage',
        {
            username: u.nick_name
        }
    );
});
router.post('/doAddSupplier', checkLogin);
router.post('/doAddSupplier', function (req, res) {
    var suppliers = {
        name: req.body.add_name,
        add_by: req.body.add_by,
        supplier_id: Math.floor(Math.random() * 1000 + 1),
        add_time: req.body.add_time,
        add_time_number: req.body.add_time_number
    };
    var supplier = new db.suppliers(suppliers);
    supplier.save(function (err) {
        if (err) res.send({
            error_msg: ['FORMAT PARAM Error'],
            info: "",
            result: "FAILED",
            code: "500",
            username: u.nick_name
        })
    });
    res.send({
        error_msg: [''],
        info: "",
        result: "SUCCESS",
        code: "200",
        username: u.nick_name
    })
});

router.post('/doChangeSupplier', checkLogin);
router.post('/doChangeSupplier', function (req, res) {
    console.log(req.body.add_name)
    console.log(req.body.add_by)
    console.log(req.body.id)
    if (req.body.add_name != '' && req.body.add_by != '') {
        db.suppliers.update({'_id': req.body.id}, {
            $set: {
                name: req.body.add_name,
                add_by: req.body.add_by
            }
        }, function (err, result) {
            if (err) {
                res.send({
                    error_msg: ['FORMAT PARAM Error'],
                    info: "",
                    result: "FAILED",
                    code: "500",
                    username: u.nick_name
                })
            } else {
                res.send({
                    error_msg: [''],
                    info: "",
                    result: "SUCCESS",
                    code: "200",
                    username: u.nick_name
                })
            }
        })
    } else {
        res.send({
            error_msg: ['FORMAT PARAM Error'],
            info: "",
            result: "FAILED",
            code: "500",
            username: u.nick_name
        })
    }
});
router.post('/doDelSuppler', checkLogin);
router.post('/doDelSuppler', function (req, res, next) {
    if (req.body.suppler_id != '') {
        db.suppliers.remove({'_id': req.body.suppler_id}, function (err, result) {
            if (err) res.send({
                error_msg: ['FORMAT PARAM Error'],
                info: "",
                result: "FAILED",
                code: "500",
                username: u.nick_name
            })
            res.send({error_msg: [''], info: "", result: "SUCCESS", code: "200", username: u.nick_name})
        })
    } else {
        res.send({
            error_msg: ['FORMAT PARAM Error'],
            info: "",
            result: "FAILED",
            code: "500",
            username: u.nick_name
        })
    }
});

/*-------------------------------------------------------------------*/
/*------------------------------图片上传------------------------------*/

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({
    storage: storage
});
router.post('/uploadSingle', upload.array('file'), function (req, res, next) {
    console.log(req.files)
    if (req.files == undefined) {
        res.send("请选择要上传的图片...");
    } else {
        var str = "文件上传成功...";
        var uploadArr = [];
        for (var i = 0; i < req.files.length; i++) {
            // var filepath = 'http://' + req.headers.host + "/tmp/" + req.files[i].originalname;
            var vitualPath = "/tmp/" + req.files[i].originalname;
            fs.renameSync(req.files[i].path, vitualPath);

            uploadArr.push(vitualPath);

        }
        console.log(uploadArr);
        res.json({
            code: 200,
            data: uploadArr
        })
        // res.render('admin/upload_goods', {upload: uploadArr, username: u.nick_name});
        // res.render('admin/upload-products-detail', {upload: uploadArr, username: u.nick_name});
    }
    // var url = 'http://' + req.headers.host + '/images/' + req.file.originalname;

});

/* 多图片上传 */
router.post('/uploadImage', upload.array("file"), function (req, res, next) {
    console.log(req.files);
    if (req.files == undefined) {
        res.send("请选择要上传的图片...");
    } else {
        var str = "文件上传成功...";
        var uploadArr = [];
        for (var i = 0; i < req.files.length; i++) {
            var filepath = './public/images/' + req.files[i].originalname;
            fs.renameSync(req.files[i].path, filepath);

            var savePath = req.files[i].originalname;
            uploadArr.push(savePath);

        }
        res.send(uploadArr[0]);
    }
});

/* 上传表格解析 */
var storage_file = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './public/crawler_file')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});
var uploads = multer({ //multer settings
    storage: storage_file,
    fileFilter: function (req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');
router.post('/uploadFile', function (req, res, next) {

    var exceltojson;
    uploads(req, res, function (err) {
        if (err) {
            res.json({error_code: 1, err_desc: err});
            return;
        }
        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.json({error_code: 1, err_desc: "No file passed"});
            return;
        }
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        console.log(req.file.path);
        try {
            exceltojson({
                input: req.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders: true
            }, function (err, result) {
                if (err) {
                    return res.json({error_code: 1, err_desc: err, data: null});
                }
                res.json({error_code: 0, err_desc: null, data: result});
            });
        } catch (e) {
            res.json({error_code: 1, err_desc: "Corupted excel file"});
        }
    })

});

/*-------------------------------------------------------------------*/
/*-------------------------------爬虫管理-----------------------------*/
/* 爬虫 */
router.get('/crawler', function (req, res, next) {
    superagent.get(req.query.link)
        .end(function (err, result) {
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(result.text);
            var items = [];
            var img = [];
            var property = [];
            var title = null;
            $('.list').find('li').each(function (idx, element) {
                var url = $(this).find('img').attr('src');
                var uniqueUrl = url.substring(url.lastIndexOf('/') + 1);
                http_origin.get(url, function (res) {
                    var imgData = "";

                    res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开

                    res.on("data", function (chunk) {
                        imgData += chunk;
                    });

                    var Rand = Math.random();
                    var save_url = config.savePath + uniqueUrl;
                    img.push(save_url);
                    res.on("end", function () {
                        fs.writeFile(save_url, imgData, "binary", function (err) {
                            // console.log(save_url);
                            if (err) {
                                console.log(err);
                            }
                        });
                    });
                });

                items.push({
                    image_id: idx,
                    image_url: uniqueUrl,
                    image_title: $(this).find('img').attr('title')
                })
            });


            $('.specTitle').find('tr').each(function (idx, element) {
                property.push({
                    pro: $(this).find('th').html(),
                    value: $(this).find('td').html()
                })
            });

            $('.prod-info-title').find('h1').each(function (idx, element) {
                title = $(this).html()
            });


            var allItems = {
                title: title,
                img: items,
                property: property
            }

            res.send(allItems);
        });
});

router.get('/crawler_manage', function (req, res, next) {
    res.render('admin/crawler', {
        username: u.nick_name
    })
})


module.exports = router;


