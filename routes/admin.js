/**
 * Created by sunNode on 16/10/13.
 */
var express = require('express');
var router = express.Router();
var http = require('http').Server(express);
var formidable = require('formidable');
var fs = require('fs');
var crypto = require('crypto');
var db = require('../model/index');
var cheerio = require('cheerio');
var superagent = require('superagent');
var http_origin = require('http');

var r = [];
var u = [];
/* GET users listing. */

//上传文件接口
router.post('/doupload', function (req, res) {
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = 'c:/livewh/public' + '/upload/';	 //设置上传目录
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

router.get('/doadminlogin', function (req, res, next) {
    console.log('111');
})
router.post('/doadminlogin', function (req, res, next) {
    // var newpassword = md5(req.body.password)
    // console.log(newpassword);
    var query = {name: req.body.name, password: req.body.password};
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
            
            // res.render('admin/login_1', {
            //     mes_info: 'login failed',
            //     mes: '账号密码错误'
            // });
            res.send('login failed');

        }
    });
});

//跳转页面-基本设置
// router.get('/mainset', checkLogin);
router.get('/mainset', function (req, res, next) {
    console.log("基本设置页面" + new Date());

    res.render('admin/index', {username: u.nick_name});
    console.log("基本设置成功" + u);
});
//MD5加密
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}


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


