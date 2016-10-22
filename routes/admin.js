var express = require('express');
var router = express.Router();
var http = require('http').Server(express);
var formidable = require('formidable');
var fs = require('fs');
var crypto = require('crypto');
var db = require('../model/index');
var async = require('async');


var r = [];
var u = [];
/* GET users listing. */

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

//后台登录界面
router.get('/', function (req, res) {
    res.render('admin/login_1', {title: '电商网站后台'});
});

//后台登录界面
router.get('/adminlogin', function (req, res) {
    res.render('admin/login_1', {title: '电商网站后台'});
});

var checkLogin = function (req, res, next) {
    if (u.length == 0) {
        res.render("404");
    }
    next();
};
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
                if (user.length == 1) {
                    console.log(user.nick_name + ":登录成功" + new Date());
                    u = user[0];
                    res.render('admin/index', {username: u.nick_name, system: system});
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
// router.get('/mainset', checkLogin);
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
//MD5加密
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

//首页轮播图片管理
router.get('/banner_manage', checkLogin);
router.get('/banner_manage', function (req, res, next) {
    console.log("图片轮播管理页面" + new Date());

    res.render('admin/banner_manage', {username: u.nick_name});
    console.log("页面访问成功");
});

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

//上传产品
router.get('/upload', checkLogin);
router.get('/upload', function (req, res) {
    res.render('admin/upload_goods', {username: u.nick_name});
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

//类目上传
router.get('/accessory_manage', checkLogin);
router.get('/accessory_manage', function (req, res, next) {
    console.log("类目管理" + new Date());
    res.render('admin/accessory_manage', {username: u.nick_name});
    // db.users.find({}, function (err, result) {
    //     if (err) throw  err;
    //
    // });
    console.log("类目管理页面登陆成功");
});

//首页头部广告替换
router.post('/doAddCategory', checkLogin);
router.post('/doAddCategory', function (req, res) {
    console.log(req.body.firstCategory);
    console.log(JSON.parse(req.body.secondCategory));
    
    var Categories = {
        firstCategory: req.body.firstCategory,
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

//用户管理
router.get('/usermanage', checkLogin);
router.get('/usermanage', function (req, res, next) {
    console.log("用户管理" + new Date());
    db.users.find({}, function (err, result) {
        if (err) throw  err;
        res.render('admin/user_manage', {users: result, username: u.nick_name});
    });
    console.log("用户管理页面登陆成功");
});

//获取用户
router.get('/douserlist', function (req, res, next) {
    console.log("当前分页" + req.query.iDisplayStart);
    db.users.find({}, function (err, result) {
        var lista = {
            "draw": 2,
            "recordsTotal": "",
            "recordsFiltered": "",
            "data": []
        };
        lista.recordsTotal = result.length;
        lista.recordsFiltered = lista.recordsTotal;
        lista.data = result;
        console.log(result);
        res.send(lista);
        res.end();
    }).sort({registerTime: -1});

});

router.get('/crawler', function (req, res, next) {
    superagent.get('http://www.miniinthebox.com/diy-3d-pvc-wall-sticker-butterfly-12-pieces-set_p1920214.html?prm=2.1.8.0')
        .end(function (err, result) {
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(result.text);
            var items = [];
            var property = [];
            $('.list').find('li').each(function (idx, element) {
                var url = $(this).find('img').attr('src');

                http_origin.get(url, function (res) {
                    var imgData = "";

                    res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开

                    res.on("data", function (chunk) {
                        imgData += chunk;
                    });

                    var Rand = Math.random();

                    var save_url = '/Users/sunNode/WebstormProjects/e-commerce-platform/public/crawel_images/' + Rand + '.jpg';

                    res.on("end", function () {
                        fs.writeFile(save_url, imgData, "binary", function (err) {
                            if (err) {
                                console.log("down fail");
                            }
                            console.log("down success");
                        });
                    });
                });

                items.push({
                    image_id: idx,
                    image_url: $(this).find('img').attr('src'),
                    image_title: $(this).find('img').attr('title')
                })
            });


            $('.specTitle').find('tr').each(function (idx, element) {
                property.push({
                    pro: $(this).find('th').html(),
                    value: $(this).find('td').html()
                })
            });

            var allItems = {
                img: items,
                property: property
            }

            res.send(allItems);
        });
});

module.exports = router;


