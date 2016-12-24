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
const express_conf = require('../public/transport/express_price.json');
const oridinary_conf = require('../public/transport/ordinary_price.json');
const little_pucket_conf = require('../public/transport/little_packet.json');


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

function getDate() {
    var date = new Date();
    var add_time = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
    return add_time
}
//验证登录
var checkLogin = function (req, res, next) {
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
    form.uploadDir = './public/upload/';	 //设置上传目录
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
/*-------------------------------------------------------------------*/
/* -------------------------------类目管理 ---------------------------*/
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
// router.post('/doAddCategory', checkLogin);
// router.post('/doAddCategory', function (req, res) {
//     console.log(req.body);
//     console.log(JSON.parse(req.body.secondCategory));
//
//     var Categories = {
//         firstCategory: req.body.firstCategory,
//         firstUrl: req.body.firstUrl,
//         firstCount: req.body.firstCount,
//         secondCategory: JSON.parse(req.body.secondCategory)
//     };
//     //保存到产品属性表
//     _.each(JSON.parse(req.body.secondCategory), function (second) {
//         _.each(second.thirdTitles, function (third) {
//             var spec = {
//                 firstCategory: req.body.firstCategory,
//                 secondCategory: second.secondTitle,
//                 thirdCategory: third.thirdTitle,
//                 specification: null,
//                 addBy: ""
//             };
//             var specs = new db.specifications(spec);
//             console.log(spec);
//             specs.save();
//         })
//     });
//
//     var category = new db.categorys(Categories);
//     category.save(function (err) {
//         console.log(err);
//         if (err) {
//             res.send('fail')
//         } else {
//             res.send('success');
//         }
//     });
// });

router.post('/doAddCategory', checkLogin);
router.post('/doAddCategory', function (req, res) {
    console.log(req.body);
    console.log(JSON.parse(req.body.secondCategory));

    var Categories = {
        firstCategory: req.body.firstCategory,
        de_firstCategory: req.body.de_firstCategory,
        firstUrl: req.body.firstUrl,
        firstCount: req.body.firstCount,
        secondCategory: JSON.parse(req.body.secondCategory)
    };
    //保存到产品属性表
    _.each(JSON.parse(req.body.secondCategory), function (second) {
        _.each(second.thirdTitles, function (third) {
            var spec = {
                firstCategory: req.body.firstCategory,
                secondCategory: second.secondTitle,
                thirdCategory: third.thirdTitle,
                de_firstCategory: req.body.de_firstCategory,
                de_secondCategory: second.de_secondTitle,
                de_thirdCategory: third.de_thirdTitle,
                specification: null,
                addBy: ""
            };
            var specs = new db.specifications(spec);
            console.log(spec);
            specs.save();
        })
    });

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
/* ----------------------------最热标签管理 -------------------------*/
//获取用户
router.get('/hotlabel', function (req, res, next) {
    console.log("当前分页" + req.query.iDisplayStart);
    db.hotLabels.find({}, null, {
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
router.get('/upload-products-detail', function (req, res, next) {
    async.parallel([
            function (done) {
                db.categorys.find({}, function (err, result) {
                    if (err) res.send('404');
                    done(err, result)
                });

            },
            function (done) {
                var compatibility = [],
                    type = [],
                    hardOrSoft = [],
                    features = [],
                    pattern = [],
                    Color = [],
                    material = [];
                _.each(tempCategory, function (temp) {
                    db.specifications.findOne({
                        'thirdCategory': temp.thirdCategory,
                        'secondCategory': temp.secondCategory
                    }, function (err, result) {
                        if (err) {
                            res.send(500)
                        } else {
                            console.log(result)
                            if (result != null) {
                                _.each(result.specification.compatibility, function (item) {
                                    compatibility.push(item.value)
                                });
                                _.each(result.specification.type, function (item) {
                                    type.push(item.value)
                                });
                                _.each(result.specification.hardOrSoft, function (item) {
                                    hardOrSoft.push(item.value)
                                });
                                _.each(result.specification.features, function (item) {
                                    features.push(item.value)
                                });
                                _.each(result.specification.Color, function (item) {
                                    Color.push(item.value)
                                });
                                _.each(result.specification.pattern, function (item) {
                                    pattern.push(item.value)
                                });
                                _.each(result.specification.material, function (item) {
                                    material.push(item.value)
                                });
                            }

                        }
                    })
                });

                var product_spectication = {
                    compatibility: compatibility,
                    type: type,
                    hardOrSoft: hardOrSoft,
                    features: features,
                    pattern: pattern,
                    Color: Color,
                    material: material
                }

                done(null, product_spectication)
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

                console.log(product_spectication)

                res.render('admin/upload-products-detail', {
                    username: u.nick_name,
                    upload: [],
                    category: categorys,
                    tempCategory: tempCategory,
                    suppliers: suppliers,
                    product_specification: {
                        compatibility: product_spectication.compatibility,
                        type: product_spectication.type,
                        hardOrSoft: product_spectication.hardOrSoft,
                        features: product_spectication.features,
                        pattern: product_spectication.pattern,
                        Color: product_spectication.Color,
                        material: product_spectication.material
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
        };
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

router.post('/deleteTemporary', function (req, res, next) {

    if (req.body.thirdCategory != '') {
        tempCategory = _.filter(function (item) {
            return item.thirdCategory != req.body.thirdCategory
        })
        res.json({status: 200, msg: 'SUCCESS'})
    } else {
        res.json({status: 403, msg: 'NOT FOUND'})
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
    var data = {
        product_title: req.body.product_title,
        product_id: (new Date().getTime()).toFixed(),
        product_supplier: req.body.product_supplier,
        product_sell_status: req.body.product_sell_status,
        product_stock_status: req.body.product_stock_status,
        product_video_link: req.body.product_video_link,
        belong_category: JSON.parse(req.body.belong_category),
        product_price: JSON.parse(req.body.product_price),
        product_danWei: JSON.parse(req.body.product_danWei)[0],
        product_market: JSON.parse(req.body.product_market)[0],
        product_origin_price: JSON.parse(req.body.product_origin_price)[0],
        product_images: JSON.parse(req.body.product_images),
        product_freight: JSON.parse(req.body.product_freight)[0],
        product_spec: JSON.parse(req.body.product_spec)
    };

    console.log(data)

    var thirdCate = [];
    _.each(data.belong_category, function (item) {
        thirdCate.push(item.third)
    });

    _.each(data.belong_category, function (item) {
        console.log(item);
        db.categorys.findOne({'secondCategory.thirdTitles.thirdTitle': item.third}, function (err, result) {
            console.log(err)
            console.log(result)
            var newArr = _.filter(result.secondCategory, function (secondCategory) {
                return secondCategory.secondTitle == item.second;
            });

            _.each(newArr[0].thirdTitles, function (thirdCategory) {
                if (thirdCategory.thirdTitle == item.third) {
                    thirdCategory.product.push(data)
                }
            });

            console.log(newArr[0].thirdTitles);
            var SEOS = {
                SEO_Name: data.product_title,
                SEO_Url: '/single-product/' + data.product_id,
                add_time: (new Date().getTime()).toFixed()
            };

            //save product in seo engine
            var SEO_V = new db.SEOS(SEOS);
            SEO_V.save();


            db.categorys.update({
                    'secondCategory._id': newArr[0]._id
                }, {
                    $inc: {
                        "firstCount": 1,
                        "secondCategory.$.secondCount": 1
                    }
                }
                , {
                    $set: {
                        "secondCategory.$.thirdTitles": newArr[0].thirdTitles
                    }
                },
                function (err, result) {
                    console.log(err);
                    console.log(result)
                })
        });

    })
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

            console.log(result.length)
            res.render('admin/specifications_manage',
                {
                    username: u.nick_name,
                    category: data,
                    specification: result
                }
            );
        });
    })

    console.log("产品上传管理登陆成功");
});

//产品基本信息录入管理-添加属性
router.post('/spec/property/add', function (req, res, next) {
    var date = new Date();
    var add_time = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
    var attribute = "specification." + req.body.addProperty
    db.specifications.update({'thirdCategory': req.body.belong},
        {
            '$pushAll': {
                [attribute]: [{
                    "name": req.body.addProperty,
                    "value": req.body.property,
                    "addTime": add_time
                }]
            }
        }, function (err, data) {
            if (err) res.json('500')
            res.send('200')
        });
});

//产品基本信息录入管理-删除属性
router.post('/spec/property/delete', function (req, res, next) {
    console.log(req.body);
    var attribute = "specification." + req.body.name
    db.specifications.update({'thirdCategory': req.body.belong},
        {
            '$pull': {
                [attribute]: {
                    "name": req.body.name,
                    "value": req.body.value
                }
            }
        }, function (err, data) {
            if (err) res.json('500')
            console.log(data)
            res.send('200')
        });
});

/*-------------------------------------------------------------------*/
/*----------------------------供应商管理------------------------------*/
//获取供应商
router.get('/supplierList', function (req, res, next) {
    console.log("当前分页" + req.query.iDisplayStart);
    db.suppliers.find({name: {$ne: '请选择'}}, null, {
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
router.get('/supplier_manage', checkLogin);
router.get('/supplier_manage', function (req, res, next) {
    res.render('admin/supplier_manage',
        {
            username: u.nick_name
        }
    );
});

// check login state
router.post('/doAddSupplier', checkLogin);
/**
 * add supplier infomation
 * @param  {[type]} req           [description]
 * @param  {[type]} res)          [description]
 * @param  {[type]} options.$inc: {'supplier_id': 1}           [description]
 * @param  {[type]} (err,         data)            [description]
 * @return {[type]}               [description]
 */
router.post('/doAddSupplier', function (req, res) {
    //query supplier id
    db.suppliers.findOneAndUpdate(
        {"name": "请选择"},
        {$inc: {'supplier_id': 1}}, (err, data)=> {
            var suppliers = {
                name: req.body.add_name,
                add_location: req.body.add_by,
                supplier_id: data.supplier_id,
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
        })
});

// check login state
router.post('/doChangeSupplier', checkLogin);
/**
 * change supplier status
 * @param  {[type]} req           [description]
 * @param  {String} res)          [description]
 * @param  {[type]} options.$set: [description]
 * @param  {[type]} function      [description]
 * @return {[type]}               [description]
 */
router.post('/doChangeSupplier', function (req, res) {
    if (req.body.add_name != '' && req.body.add_by != '') {
        db.suppliers.update({'_id': req.body.id}, {
            $set: {
                name: req.body.add_name,
                add_location: req.body.add_by,
                add_time: getDate()
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
// check login state
router.post('/doDelSuppler', checkLogin);
/**
 * DEL supplier status
 * @param  {[type]} req           [description]
 * @param  {String} res)          [description]
 * @param  {[type]} options.$set: [description]
 * @param  {[type]} function      [description]
 * @return {[type]}               [description]
 */
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
    console.log(req.files);
    if (req.files == undefined) {
        res.send("请选择要上传的图片...");
    } else {
        var str = "文件上传成功...";
        var uploadArr = [];
        for (var i = 0; i < req.files.length; i++) {
            var filepath = './public/images/' + req.files[i].originalname;
            var vitualPath = "/images/" + req.files[i].originalname;
            fs.renameSync(req.files[i].path, filepath);

            uploadArr.push(vitualPath);

        }
        console.log(req.files.length)
        console.log(uploadArr);
        res.json({
            code: 200,
            data: uploadArr
        })
    }
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

/*--------------------------------------------------------------------------*/

/*-----------------------------------爬虫管理--------------------------------*/
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
/*-------------------------------------------------------------------------*/

/*---------------------------------运费模板管理------------------------------*/
router.get('/shopping_template', (req, res) => {
    res.render('admin/templates/shopping-templates', {username: u.nick_name})
})

/**
 * ROUTER FEE  GET Method
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.get('/fee_manage', (req, res) => {
    res.render('admin/templates/fee-manage', {username: u.nick_name})
})

/**
 * ADD FEE POST Method
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.post('/fee', (req, res) => {
    if (!req.body) res.end(401, {succeed: false, msg: 'Invalid Param Request'})
    const fee = new db.fee(req.body);
    fee.save(function (err) {
        if (err) res.send(500, {succeed: false, msg: 'Internal Server Error'})
    });
    res.send(200, {succeed: true, msg: "success"})

})

/**
 * ADD DELTA PRICE POST Method
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.post('/delta-price', (req, res)=> {
    console.log(req.body)
    if (!req.body) res.end(401, {succeed: false, msg: 'Invalid Param Request'})
    const delta_price = new db.deltaPrice(req.body);
    delta_price.save(function (err) {
        if (err) res.end(500, {succeed: false, msg: 'Internal Server Error'})
    });
    res.send(200, {succeed: true, msg: "success"})

})

/**
 * Modify DELTA PRICE PUT Method
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.put('/delta-price', (req, res)=> {

    if (!req.body) res.end(401, {succeed: false, msg: 'Invalid Param Request'})
    db.deltaPrice.findOneAndUpdate({_id: req.body.id},
        {
            $set: {
                delta_price: req.body.delta_price,
                update_time: req.body.update_time
            }
        },
        (err, data)=> {
            if (err) res.end(500, {succeed: false, msg: 'Internal Server Error'})
            res.send({succeed: true, msg: "success"})
        })
})

/**
 * Delete FEE DEL Method
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.delete('/fee', (req, res)=> {
    console.log(req.body)
    db.fee.remove({
        _id: req.body.id
    }, (err, data)=> {
        if (err) res.end(500, {succeed: false, msg: 'Internal Server Error'})
        res.send({succeed: true, msg: "success"})
    })
})

/**
 * Modify FEE PUT Method
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.put('/fee', (req, res)=> {
    if (!req.body) res.end(401, {succeed: false, msg: 'Invalid Param Request'})
    db.fee.findOneAndUpdate({_id: req.body.id},
        {
            $set: {
                country_name: req.body.country_name,
                country_fee: req.body.country_fee,
                update_time: req.body.update_time,
                update_time_sort: req.body.update_time_sort
            }
        },
        (err, data)=> {
            if (err) res.end(500, {succeed: false, msg: 'Internal Server Error'})
            res.send({succeed: true, msg: "success"})
        })
})

/**
 * GET FEE LIST
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.get('/feelist', (req, res, next)=> {
    console.log(`current display page: ${req.query.iDisplayStart}`)
    db.fee.find({}, null, {
        sort: {
            'update_time_sort': 1
        }
    }, function (err, result) {
        if (err) next(customError(err.status, err, res))
        var lista = {
            "draw": 2,
            "recordsTotal": "",
            "recordsFiltered": "",
            "data": []
        };
        lista.recordsTotal = result.length
        lista.recordsFiltered = lista.recordsTotal
        lista.data = result
        res.send(lista)
        res.end()
    })
})

/**
 * [Description]
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.post('/transport', (req, res)=> {

    if (req.body.weight == 'undefined' || req.body.area == 'undefined') {
        res.send(401, {code: 401, msg: "Params Error"})
        return
    }

    if (req.body.weight == '' || req.body.area == '') {
        res.send(401, {code: 401, msg: "Params Error"})
        return
    }

    var weight = Number(req.body.weight);
    console.log('weight : %d', weight)
    var area = req.body.area;
    var execution_weight = 0;
    var express_price = 0;
    var ordinary_price = 0;
    var little_packet_price = 0;
    var little_packet_weight = 0;
    var ordinary_weight = 0;
    var decimal_weight = weight - Math.floor(weight);
    //特快处理
    if (weight < 0.5) {
        execution_weight = 0.5
    } else {
        if (decimal_weight < 0.5) {
            decimal_weight = 0.5
        } else {
            decimal_weight = 1
        }
    }
    execution_weight = execution_weight + decimal_weight;

    //普快处理
    var ordinary_length = weight.toString().substring(weight.toString().indexOf('.') + 1, weight.toString().length).length
    if (ordinary_length > 1) {
        ordinary_weight = Math.ceil(weight * 10) / 10
    }
    ordinary_weight = weight

    //小包处理
    if (weight < 2) {
        var little_packet_length = weight.toString().substring(weight.toString().indexOf('.') + 1, weight.toString().length).length
        console.log(little_packet_length)
        if (little_packet_length > 1) {
            little_packet_weight = Math.ceil(weight * 10) / 10
        }
        little_packet_weight = weight

        console.log(weight)
    }

    try {
        if (weight < 2) {
            express_price = getTransportPrice(express_conf, execution_weight, area)
            ordinary_price = getTransportPrice(oridinary_conf, ordinary_weight, area)
            little_packet_price = getLittleTransportPrice(little_pucket_conf, little_packet_weight)

            res.send(200, {
                express: {price: express_price, msg: "特快快递"},
                ordinary: {price: ordinary_price, msg: "普通快递"},
                little_packet: {price: little_packet_price, msg: "小包"}
            });
        }
        else if (weight < 21) {
            express_price = getTransportPrice(express_conf, execution_weight, area)
            ordinary_price = getTransportPrice(oridinary_conf, ordinary_weight, area)
            console.log(ordinary_price)
            console.log(express_price)
            res.send(200, {
                express: {price: express_price, msg: "特快快递"},
                ordinary: {price: ordinary_price, msg: "普通快递"},
            });
        } else {
            var origin_weight = '';
            if (weight <= 44) {
                origin_weight = '21-44'
            } else if (weight <= 70) {
                origin_weight = '45-70'
            } else if (weight <= 100) {
                origin_weight = '71-99'
            } else if (weight <= 299) {
                origin_weight = '100-299'
            } else if (weight <= 499) {
                origin_weight = '300-499'
            } else if (weight <= 999) {
                origin_weight = '500-999'
            } else {
                origin_weight = '1000+'
            }
            ordinary_price = getOrdinaryTransportPrice(oridinary_conf, origin_weight, ordinary_weight, area)
            res.send(200, {
                ordinary: {price: ordinary_price, msg: "普通快递"},
            });
        }
    } catch (e) {
        console.log(e)
        res.send(404, {code: 404, msg: "NOT FOUND"})
    }
});

/**
 * calculate express/ordinary transport price
 * @param type translate conf
 * @param weight
 * @returns {number}
 */
function getTransportPrice(type, weight, area) {
    console.log('area:' + area)
    console.log('type: %d,weight: %d', type, weight)
    return parseInt(type.data.filter((item)=> {
            return item.zh.indexOf(area) > -1
        })[0][weight.toString()]) * weight;
}
/**
 * calculate ordinary translate price when weight bigger then 20
 * @param type
 * @param origin_weight
 * @param weight
 * @param area
 * @returns {number}
 */
function getOrdinaryTransportPrice(type, origin_weight, weight, area) {
    console.log('area:' + area)
    console.log('type: %d,weight: %d', type, weight)
    return parseInt(type.data.filter((item)=> {
            return item.zh.indexOf(area) > -1
        })[0][origin_weight]) * weight;
}
/**
 * calculate little transport price
 * @param type
 * @param weight
 * @returns {Number}
 */
function getLittleTransportPrice(type, weight) {
    console.log('type: %d,weight: %d', '小包', weight)
    return parseInt(type.data.filter((item)=> {
            return item['kg'].indexOf(weight.toString()) > -1;
        })[0]['fee']) * weight;
}
/*------------------------------------------------------------------------*/


module.exports = router;


