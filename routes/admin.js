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
var superagent=require('superagent');
var cheerio=require('cheerio');
var http_origin=require('http');

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

router.get('', function (req, res) {
    res.render('admin/login_1', {title: '电商网站后台'});
});

//后台登录界面
router.get('/adminlogin', function (req, res) {
    res.render('admin/login_1', {title: '电商网站后台'});
});

var checkLogin = function (req, res, next) {
    console.log(req);
    if (req.body.status != 'test') {
        if (u.length == 0) {
            res.render('admin/404', {username: u.nick_name});
        }
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
    db.categorys.find({}, function (err, result) {
        if (err) res.send('404');
        console.log(result);
        res.render('admin/upload_goods', {username: u.nick_name, upload: [], category: result});
    });

});

//上传产品详细信息
router.get('/upload-products-detail', function (req, res) {
    db.categorys.find({}, function (err, result) {
        if (err) res.send('404');
        console.log(result);
        res.render('admin/upload-products-detail', {username: u.nick_name, upload: [], category: result});
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

//用户管理
router.get('/hot_product_manage', checkLogin);
router.get('/hot_product_manage', function (req, res, next) {
    console.log("最热产品管理" + new Date());
    db.users.find({}, function (err, result) {
        if (err) throw  err;
        res.render('admin/hot_product_manage', {users: result, username: u.nick_name});
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


/*-------------------------------------------------------------------*/
/* ----------------------------上传产品模块 -------------------------*/
router.post('/uploadTemporary', function (req, res, next) {
    if (req.body.firstCategory == '' && req.body.secondCategory != '') {
        res.send({error_msg: ['FORMAT PARAM Error'], info: "", result: "fail", code: "400"})
    } else {
        var Categories = {
                firstCategory: req.body.firstCategory,
                secondCategory: req.body.secondCategory,
                thirdCategory: req.body.thirdCategory,
                addBy: u.nick_name,
                upload_time: (new Date().getTime() / 1000).toFixed(),
                status: 'NEW'
            }
            ;
        var category = new db.uploadTemporarys(Categories);
        category.save(function (err) {
            console.log(err);
            if (err) {
                console.log(err);
                res.send({error_msg: ['INTERNAL SERVER ERROR'], info: "", result: "fail", code: "500"})
            } else {
                db.uploadTemporarys.find({}, null, {
                    sort: {
                        upload_time: -1
                    }
                }, function (err, result) {
                    if (err) {
                        res.send({error_msg: ['INTERNAL SERVER ERROR'], info: "", result: "fail", code: "500"});
                    } else {
                        res.send({error_msg: [], info: result, result: "success", code: "200"});
                    }

                });

            }
        });
    }
});

router.post('/getGoodsDetail', function (req, res, next) {
    if (req.body.firstCategory == '' && req.body.secondCategory != '') {
        res.send({error_msg: ['FORMAT PARAM Error'], info: "", result: "fail", code: "400"})
    } else {
        var Categories = {
            firstCategory: req.body.firstCategory,
            secondCategory: req.body.secondCategory,
            thirdCategory: req.body.thirdCategory,
            addBy: u.nick_name,
            status: 'NEW'
        };
        res.send('admin/upload_goods_detail', {error_msg: [], info: Categories, result: "success", code: "200"});
    }
});

/* 多图片上传 */
router.post('/uploadImage', upload.array("file"), function (req, res, next) {
    if (req.files == undefined) {
        res.send("请选择要上传的图片...");
    } else {
        var str = "文件上传成功...";
        var uploadArr = [];
        for (var i = 0; i < req.files.length; i++) {
            var filepath = '/Users/sunNode/WebstormProjects/e-commerce-platform/public' + "/tmp/" + req.files[i].originalname;
            fs.renameSync(req.files[i].path, filepath);

            var savePath = '/tmp/' + req.files[i].originalname;
            uploadArr.push(savePath);

        }
        console.log(uploadArr);
        // res.render('admin/upload_goods', {upload: uploadArr, username: u.nick_name});
        res.render('admin/accessory_manage', {upload: uploadArr, username: u.nick_name});
    }
});

/* 上传表格解析 */
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, '/Users/sunNode/WebstormProjects/e-commerce-platform/public/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});
var uploads = multer({ //multer settings
    storage: storage,
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


/* 爬虫 */
router.get('/crawler', function (req, res, next) {
    superagent.get('http://www.miniinthebox.com/high-premium-pc-full-body-cover-with-tempered-glass-film-case-for-iphone-5-5s-se_p4972423.html?category_id=9361&prm=2.2.1.1')
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


