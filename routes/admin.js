const express = require('express')
const router = express.Router()
const http = require('http').Server(express)
const formidable = require('formidable')
const fs = require('fs')
const Utils = require('../utils')
const async = require('async')
const multer = require('multer')
const xlstojson = require('xls-to-json-lc')
const xlsxtojson = require('xlsx-to-json-lc')
const superagent = require('superagent')
const cheerio = require('cheerio')
const http_origin = require('http')
const _ = require('lodash')
const path = require('path')
const db = require('../model/index')
const config = require('../config')
const express_conf = require('../public/transport/express_price.json')
const oridinary_conf = require('../public/transport/ordinary_price.json')
const little_pucket_conf = require('../public/transport/little_packet.json')

var r = []
var u = []
var leverlist = []
var systems = []
var tempCategory = []

// 验证登录
let checkLogin = (req, res, next) => {
  if (req.body.status != 'test') {
    if (u.length === 0) {
      res.render('admin/mainsets/404', {username: u.nick_name})
    }
  }
  next()
}

function customError (code, msg, response) {
  response.send(code, msg)
}

/* ------------------------------------------------------------------- */
/* -----------------------管理员登录 --------------------------------- */
// 后台登录界面
router.get('/', function (req, res) {
  res.render('admin/backend-login', {title: '电商网站后台', login_status: true})
})

// 默认路径
router.get('', function (req, res) {
  res.render('admin/backend-login', {title: '电商网站后台', login_status: true})
})

// 进入主页
router.get('/main', function (req, res) {
  res.render('admin/backend-homepage', {username: u.nick_name})
})

// 后台登录界面
router.get('/adminlogin', (req, res) => {
  res.render('admin/backend-login', {title: '电商网站后台', login_status: true})
})

// 后台登陆处理
router.post('/doadminlogin', function (req, res) {
  let query = {name: req.body.name, password: req.body.password, level: '66'}
  async.parallel([
    function (done) {
      db.users.find(query, function (err, users) {
        if (err) {
          console.log(err)
        }
        done(err, users)
      })
    },
    function (done) {
      db.systems.findOne({}, null, {
        sort: {
          'updateTime': -1
        }
      }, function (err, system_info) {
        done(err, system_info)
      })
    },
    function (done) {
      db.users.find({name: req.body.name}, function (err, users) {
        if (err) {
          console.log(err)
        }
        done(err, users)
      })
    }
  ],
        function (err, results) {
          if (err) {
            done(err)
          } else {
            let user = results[0]
            let system = results[1]
            let user_name = results[2]
            console.log(user_name)
            console.log(user)
            systems = system
            if (user.length === 1) {
              console.log(user.nick_name + ':登录成功' + new Date())
              u = user[0]
              global.u = user[0]
              res.render('admin/backend-homepage', {username: u.nick_name, system: system})
            } else {
              console.log(query.name + ':登录失败' + new Date())
              let payload = {}
              if (user_name.length === 0) {
                payload.mes_info = '用户名错误'
              } else {
                payload.mes_info = '密码错误'
              }
              payload.login_status = false
              res.render('admin/backend-login', payload)
            }
          }
        })
})

/* ------------------------------------------------------------------- */
/* -----------------------------用户管理 ---------------------------- */
// 获取用户
router.get('/douserlist', function (req, res, next) {
  console.log('当前分页' + req.query.iDisplayStart)
  db.users.find({}, null, {
    sort: {
      'registerTime': 1
    }
  }, function (err, result) {
    var lista = {
      'draw': 2,
      'recordsTotal': '',
      'recordsFiltered': '',
      'data': []
    }
    lista.recordsTotal = result.length
    lista.recordsFiltered = lista.recordsTotal
    lista.data = result
        // console.log(result);
    res.send(lista)
    res.end()
  })
})
// 用户管理
router.get('/usermanage', checkLogin)
router.get('/usermanage', function (req, res, next) {
  console.log('用户管理' + new Date())
  async.parallel([
    function (done) {
      db.users.find({}, function (err, users) {
        if (err) {
          console.log(err)
        }
        done(err, users)
      })
    },
    function (done) {
      db.levels.find({},
                    function (err, levels) {
                      console.log(levels)
                      leverlist = levels[0].level
                      done(err, levels)
                    })
    }
  ],
        function (err, results) {
          if (err) {
            done(err)
          } else {
            var user = results[0]
            var level = results[1]
                // console.log(user);
            console.log(leverlist)
            if (user.length > 1) {
              console.log('用户管理页面登陆成功')
              res.render('admin/user/user-manage', {users: user, username: u.nick_name, lvlist: leverlist})
            } else {
              res.render('admin/backend-login', {
                mes_info: 'login failed',
                mes: '账号密码错误'
              })
            }
          }
        }
    )
})
// 删除用户
router.post('/doDelUer', checkLogin)
router.post('/doDelUer', function (req, res, next) {
  console.log('用户删除' + new Date())
  console.log(req.body.user_id)
  db.users.remove({_id: req.body.user_id}, function (err) {
    if (err) {
      res.send({'error_msg': ['ERROR'], 'info': '', 'result': 'fail', 'code': '500'})
    }
    res.send({'error_msg': [], 'info': '', 'result': 'success', 'code': '200'})
  })
})

// 添加用户
router.post('/doAddUser', checkLogin)
router.post('/doAddUser', function (req, res, next) {
  console.log('用户添加' + req.body.addName + new Date())
  var date = Date()
  var doc = {
    name: req.body.addname,
    password: Utils.PassHash.HashMD5(req.body.addpassword),
    nick_name: req.body.addnickname,
    level: req.body.addLevel,
    levelName: req.body.addLevelName,
    registerTime: req.body.registerTime
  }
  var robot = new db.users(doc)
  robot.save(function (err) {
    if (err) // ...
        { console.log('meow') }
    res.end()
  })
})

// 修改用户
router.post('/doChangeUser', checkLogin)
router.post('/doChangeUser', function (req, res, next) {
  console.log('用户修改' + new Date())
  let newPassword
  if (req.body.addpassword === '********') {
    newPassword = req.body.oldPassword
  } else {
    newPassword = Utils.PassHash.HashMD5(req.body.addpassword)
  }
  console.log(req.body)
  db.users.update({_id: req.body.id}, {
    $set: {
      name: req.body.addname,
      password: newPassword,
      nick_name: req.body.addnickname,
      level: req.body.addLevel,
      levelName: req.body.addLevelName
    }

  }, function (err, data) {
    if (err) return res.send(500, 'Error occurred: database Error')
    res.end()
  })
})

/* ------------------------------------------------------------------- */
/* -----------------------------商城前台管理 ------------------------- */
// 网站语言管理
router.get('/language_manage', (req, res) => {
  res.render('admin/mainsets/language-manage', {username: u.nick_name})
})

// 获取用户
router.get('/languagelist', (req, res) => {
  db.systems.find({}, (err, result) => {
    if (err) return res.send(500, 'Error occurred: database Error')
    var lista = {
      'draw': 2,
      'recordsTotal': '',
      'recordsFiltered': '',
      'data': []
    }
    if (result[0].languages) {
      result = result[0].languages
    } else {
      result = []
    }
    lista.recordsTotal = result.length
    lista.recordsFiltered = lista.recordsTotal
    lista.data = result
    res.send(lista)
    res.end()
  })
})

// CURD
router.post('/language', (req, res) => {
  if (req.body) {
    db.systems.findOneAndUpdate({}, {
      $push: {
        languages: {
          language: req.body.language,
          isDefault: req.body.isDefault,
          update_time: req.body.update_time
        }
      }
    }, (err, back) => {
      if (err) return res.send(500, 'Error occurred: database Error')
      if (back) {
        res.send({succeed: true, msg: 'ok'})
      } else {
        res.send({succeed: false, msg: 'fail'})
      }
    })
  } else {
    res.send({succeed: false, msg: 'fail'})
  }
})

router.delete('/language', (req, res) => {
  if (req.body) {
    db.systems.findOneAndUpdate({}, {
      $pull: {
        languages: {_id: req.body._id}
      }
    }, (err, back) => {
      if (err) return res.send(500, 'Error occurred: database Error')
      if (back) {
        res.send({succeed: true, msg: 'ok'})
      } else {
        res.send({succeed: false, msg: 'fail'})
      }
    })
  }
})

router.put('/language', (req, res) => {
  if (req.body) {
    db.systems.findOneAndUpdate({}, {
      $set: {
        languages: {
          language: req.body.language,
          isDefault: req.body.isDefault,
          update_time: req.body.update_time
        }
      }
    }, (err, back) => {
      if (err) return res.send(500, 'Error occurred: database Error')
      if (back) {
        res.send({succeed: true, msg: 'ok'})
      } else {
        res.send({succeed: false, msg: 'fail'})
      }
    })
  } else {
    res.send({succeed: false, msg: 'fail'})
  }
})

// 上传文件接口
router.post('/doupload', function (req, res) {
  let form = new formidable.IncomingForm()   // 创建上传表单
  form.encoding = 'utf-8'		// 设置编辑
  form.uploadDir = './public/upload/'	 // 设置上传目录
  form.keepExtensions = true	 // 保留后缀
  form.maxFieldsSize = 2 * 1024 * 1024   // 文件大小
  form.parse(req, function (err, fields, files) {
    if (err) {
      res.locals.error = err
      res.end()
      return
    }

    var extName = ''  // 后缀名
    switch (files.fulAvatar.type) {
      case 'image/pjpeg':
        extName = 'jpg'
        break
      case 'image/jpeg':
        extName = 'jpg'
        break
      case 'image/png':
        extName = 'png'
        break
      case 'image/x-png':
        extName = 'png'
        break
    }

    if (extName.length === 0) {
      res.locals.error = '只支持png和jpg格式图片'
      res.end()
      return
    }

    var avatarName = Math.random() + '.' + extName
    var newPath = form.uploadDir + avatarName
    var savePath = '/upload/' + avatarName
    res.json(savePath)
    res.end()
    console.log(savePath)
    fs.renameSync(files.fulAvatar.path, newPath)  // 重命名
  })

  res.locals.success = '上传成功'
})

// 首页轮播图片管理
router.get('/banner_manage', checkLogin)
router.get('/banner_manage', function (req, res, next) {
  console.log('图片轮播管理页面' + new Date())

  res.render('admin/front/banner-manage', {username: u.nick_name})
  console.log('页面访问成功')
})

// 更改注册须知
router.post('/doChangeConditions', checkLogin)
router.post('/doChangeConditions', function (req, res) {
  console.log('更改注册须知' + req.body.mainContent + new Date())
  db.systems.update({name: 'register_need_know'}, {$set: {mainContent: req.body.mainContent}}, function (err, system) {
    if (err) {
      res.send('failed')
    } else {
      res.send('success')
    }
  })
})

// 上传产品
// router.get('/upload', checkLogin);
// router.get('/upload', function (req, res) {
//     db.category.find({}, function (err, category) {
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

// 首页轮播图片替换
router.post('/saveBanners', checkLogin)
router.post('/saveBanners', function (req, res) {
  console.log('Banners 添加' + req.body.image_url + new Date())
  var banner = {
    image_url: req.body.image_url,
    upload_time: req.body.upload_time,
    status: req.body.status,
    type: req.body.type
  }

  var banners = new db.banners(banner)
  banners.save(function (err) {
    if (err) {
      console.log('添加失败')
      res.send('fail')
    } else {
      res.send('success')
    }
  })
})

// 首页头部广告管理
router.get('/head_banner_manage', checkLogin)
router.get('/head_banner_manage', function (req, res, next) {
  console.log('头部广告轮播管理页面' + new Date())
  db.banners.find({'type': 'headBanner', 'status': 'New'}, function (err, result) {
    if (err) throw err
    res.render('admin/front/head-banner-manage', {image_url: result[0], username: u.nick_name})
  })
  console.log('头部广告轮播管理页面访问成功')
})

// 首页头部广告替换
router.post('/saveHeadBanners', checkLogin)
router.post('/saveHeadBanners', function (req, res) {
  console.log('Head Banners add' + req.body.image_url + new Date())
  db.banners.update({
    type: 'headBanner',
    status: 'New'
  }, {
    '$set': {
      status: 'OFFLINE'
    }
  }, (err, m) => {
    console.log(err)
    console.log(m)
    let banner = {
      image_url: req.body.image_url,
      upload_time: req.body.upload_time,
      status: req.body.status,
      type: req.body.type
    }
    let banners = new db.banners(banner)
    banners.save(function (err) {
      if (err) {
        res.send('fail')
      } else {
        res.send('success')
      }
    })
  })
})

// 注册须知页面
router.get('/register_notice', checkLogin)
router.get('/register_notice', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    },
    (done) => {
      db.de_notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German) {
      res.render('admin/notices/register-notice', {
        registerNotice: English.register_notice,
        de_registerNotice: German.register_notice,
        username: u.nick_name
      })
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 注册须知页面
router.post('/register-notice', checkLogin)
router.post('/register-notice', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOneAndUpdate({}, {
        $set: {
          register_notice: [{
            main_content: req.body.mainContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, register_notice) => {
        if (err) return done(null, false)
        done(null, true)
      })
    },
    (done) => {
      db.de_notices.findOneAndUpdate({}, {
        $set: {
          register_notice: [{
            main_content: req.body.mainGermanContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, register_notice) => {
        if (err) return done(null, false)
        done(null, true)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German && German === true) {
      res.send({succeed: true, msg: 'ok'})
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 关于我们管理页面
router.get('/about_us', checkLogin)
router.get('/about_us', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    },
    (done) => {
      db.de_notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German) {
      res.render('admin/notices/about-us', {
        aboutUs: English.about_us,
        de_aboutUs: German.about_us,
        username: u.nick_name
      })
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 更改我们管理页面
router.post('/about-us', checkLogin)
router.post('/about-us', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOneAndUpdate({}, {
        $set: {
          about_us: [{
            main_content: req.body.mainContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, aboutUs) => {
        if (err) return done(null, false)
        done(null, true)
      })
    },
    (done) => {
      db.de_notices.findOneAndUpdate({}, {
        $set: {
          about_us: [{
            main_content: req.body.mainGermanContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, aboutUs) => {
        if (err) return done(null, false)
        done(null, true)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German && German === true) {
      res.send({succeed: true, msg: 'ok'})
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 联系我们管理页面
router.get('/contact_us', checkLogin)
router.get('/contact_us', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    },
    (done) => {
      db.de_notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German) {
      res.render('admin/notices/contact-us', {
        contactUs: English.contact_us,
        de_contactUs: German.contact_us,
        username: u.nick_name
      })
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 更改联系我们管理页面
router.post('/contact-us', checkLogin)
router.post('/contact-us', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOneAndUpdate({}, {
        $set: {
          contact_us: [{
            main_content: req.body.mainContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, aboutUs) => {
        if (err) return done(null, false)
        done(null, true)
      })
    },
    (done) => {
      db.de_notices.findOneAndUpdate({}, {
        $set: {
          contact_us: [{
            main_content: req.body.mainGermanContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, aboutUs) => {
        if (err) return done(null, false)
        done(null, true)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German && German === true) {
      res.send({succeed: true, msg: 'ok'})
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 关于FAQ页面
router.get('/FAQ', checkLogin)
router.get('/FAQ', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    },
    (done) => {
      db.de_notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German) {
      res.render('admin/notices/faq', {
        faq: English.FAQ,
        de_faq: German.FAQ,
        username: u.nick_name
      })
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 更改FAQ页面
router.post('/faq', checkLogin)
router.post('/faq', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOneAndUpdate({}, {
        $set: {
          FAQ: [{
            main_content: req.body.mainContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, aboutUs) => {
        if (err) return done(null, false)
        done(null, true)
      })
    },
    (done) => {
      db.de_notices.findOneAndUpdate({}, {
        $set: {
          FAQ: [{
            main_content: req.body.mainGermanContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, aboutUs) => {
        if (err) return done(null, false)
        done(null, true)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German && German === true) {
      res.send({succeed: true, msg: 'ok'})
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 关于attention页面
router.get('/attention', checkLogin)
router.get('/attention', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    },
    (done) => {
      db.de_notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German) {
      res.render('admin/notices/attention', {
        attention: English.attention,
        de_attention: German.attention,
        username: u.nick_name
      })
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 更改attention页面
router.post('/attention', checkLogin)
router.post('/attention', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOneAndUpdate({}, {
        $set: {
          attention: [{
            main_content: req.body.mainContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, attention) => {
        if (err) return done(null, false)
        done(null, true)
      })
    },
    (done) => {
      db.de_notices.findOneAndUpdate({}, {
        $set: {
          attention: [{
            main_content: req.body.mainGermanContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, attention) => {
        if (err) return done(null, false)
        done(null, true)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German && German === true) {
      res.send({succeed: true, msg: 'ok'})
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 关于privacy页面
router.get('/privacy', checkLogin)
router.get('/privacy', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    },
    (done) => {
      db.de_notices.findOne({}, (err, allNotices) => {
        done(null, allNotices)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German) {
      res.render('admin/notices/privacy', {
        privacy: English.privacy_notice,
        de_privacy: German.privacy_notice,
        username: u.nick_name
      })
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 更改privacy页面
router.post('/privacy', checkLogin)
router.post('/privacy', (req, res) => {
  async.parallel([
    (done) => {
      db.notices.findOneAndUpdate({}, {
        $set: {
          privacy_notice: [{
            main_content: req.body.mainContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, attention) => {
        if (err) return done(null, false)
        done(null, true)
      })
    },
    (done) => {
      db.de_notices.findOneAndUpdate({}, {
        $set: {
          privacy_notice: [{
            main_content: req.body.mainGermanContent,
            add_time: new Date().getTime(),
            addBy: u.nick_name
          }]
        }
      }, (err, attention) => {
        if (err) return done(null, false)
        done(null, true)
      })
    }
  ], (err, results) => {
    let [English, German] = results
    if (English && German && German === true) {
      res.send({succeed: true, msg: 'ok'})
    } else {
      res.send({succeed: false, msg: 'DB Error'})
    }
  })
})

// 最热产品管理
router.get('/hot_product_manage', checkLogin)
router.get('/hot_product_manage', function (req, res, next) {
  console.log('最热产品管理' + new Date())
  db.users.find({}, function (err, result) {
    if (err) throw err
    res.render('admin/front/hot-product-manage', {users: result, username: u.nick_name})
  })
  console.log('用户管理页面登陆成功')
})
/* ------------------------------------------------------------------- */
/* -------------------------------类目管理 --------------------------- */
router.get('/accessory_manage', checkLogin)
router.get('/accessory_manage', (req, res) => {
  db.categorys.find({}, (err, categories) => {
    if (err) res.send('404')
    res.render('admin/product/accessory-manage', {
      username: u.nick_name,
      upload: [],
      category: categories,
      language: 'en'
    })
  })
})

router.get('/accessory_manage_german', checkLogin)
router.get('/accessory_manage_german', (req, res) => {
  db.categorys.find({}, (err, categories) => {
    if (err) res.send('404')
    new Promise((resolve, reject) => {
      _.each(categories, (category) => {
        category.firstCategory_color = category.firstCategory === category.de_firstCategory ? 'red' : 'black'
        category.firstCategory = category.de_firstCategory || category.firstCategory
        if (typeof category.secondCategory !== 'undefined') {
          _.each(category.secondCategory, (second) => {
            second.secondTitle_color = second.de_secondTitle === second.secondTitle ? 'red' : 'black'
            second.secondTitle = second.de_secondTitle || second.secondTitle
            if (typeof second.thirdTitles !== 'undefined') {
              _.each(second.thirdTitles, (third) => {
                third.thirdTitle_color = third.de_thirdTitle === third.thirdTitle ? 'red' : 'black'
                third.thirdTitle = third.de_thirdTitle || third.thirdTitle
              })
            }
          })
        }
      })
      resolve(categories)
    })
            .then((categories) => {
              res.render('admin/product/accessory-manage', {
                username: u.nick_name,
                upload: [],
                category: categories,
                language: 'de'
              })
            })
            .catch((err) => {
              res.send(err.statusCode, err.message)
            })
  })
})
// English category
router.delete('/category_manage', (req, res) => {
  let [first, second, third] = [req.body.firstCategory, req.body.secondCategory, req.body.thirdCategory]
  console.log(first)
  console.log(second)
  console.log(third)
  let queryResult = new Promise((resolve, reject) => {
    db.categorys.findOne({firstCategory: first}, (err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
  queryResult
        .then((totalCategory) => {
          return new Promise((resolve, reject) => {
            if (first && second === '' && third === '') {
              totalCategory = ''
              db.specifications.remove({
                firstCategory: first
              }, (err, result) => {
                if (err) throw Error()
              })
            }
            resolve(totalCategory)
          })
                .then((total_Category) => {
                  if (first && second && third === '') {
                    db.specifications.remove({
                      firstCategory: first,
                      secondCategory: second

                    }, (err, result) => {
                      console.log(err)
                            // if (err) throw Error()
                    })
                    _.each(total_Category.secondCategory, (item, key) => {
                      if (typeof item !== 'undefined') {
                        if (typeof item.secondTitle !== 'undefined' && item.secondTitle === second) {
                          totalCategory.secondCategory.splice(key, 1)
                        }
                      }
                    })
                  }
                  return total_Category
                })
                .then((total_Category) => {
                  if (first && second && third) {
                    db.specifications.remove({
                      firstCategory: first,
                      secondCategory: second,
                      thirdCategory: third
                    }, (err, result) => {
                      if (err) throw Error()
                    })
                    _.each(total_Category.secondCategory, (item) => {
                      if (item.secondTitle === second) {
                        _.each(item.thirdTitles, (thirdItem, key) => {
                          console.log(thirdItem)
                          if (typeof thirdItem !== 'undefined') {
                            if (typeof thirdItem.thirdTitle !== 'undefined' && thirdItem.thirdTitle === third) {
                              delete item.thirdTitles.splice(key, 1)
                            }
                          }
                        })
                      }
                    })
                  }
                  return total_Category
                })
                .then((total_Category) => {
                  return total_Category
                })
        })
        .then((final) => {
          console.log(final)
          console.log('final')
          if (final === '') {
            db.categorys.remove({
              firstCategory: first
            }, (err, result) => {
              if (err || !result) return res.send(500, {succeed: false, msg: 'DBError'})
              res.send(200, {succeed: true, msg: 'ok'})
            })
          } else {
            db.categorys.update({
              firstCategory: first
            }, {
              '$set': {
                secondCategory: final.secondCategory
              }
            }, (err, result) => {
              if (err || !result) return res.send(500, {succeed: false, msg: 'DBError'})
              res.send(200, {succeed: true, msg: 'ok'})
            })
          }
        })
        .catch(err => {
          console.log(err)
        })
})

router.put('/category_manage', (req, res) => {
  var specification = {}
  console.log(req.body)
  let specPromise = new Promise((resolve, reject) => {
    db.specifications.findOne({
      firstCategory: req.body.originFirstCategory
    }, (err, specs) => {
      if (err) reject(err)
      resolve(specs)
    }
        )
  })

  specPromise
        .then((specs) => {
          specification = specs
          let queryResult = new Promise((resolve, reject) => {
            db.categorys.findOne({firstCategory: req.body.originFirstCategory}, (err, result) => {
              if (err) reject(err)
              resolve(result)
            })
          })
          queryResult
                .then((totalCategory) => {
                  return new Promise((resolve, reject) => {
                    if (req.body.first === 'true') {
                      totalCategory.firstCategory = req.body.firstCategory
                      specification.firstCategory = req.body.firstCategory
                    }
                    resolve(totalCategory)
                  })
                        .then((totalCategory) => {
                          if (req.body.second === 'true') {
                            specification.secondCategory = req.body.secondCategory
                            _.each(totalCategory.secondCategory, (item) => {
                              if (item.secondTitle === req.body.originSecondCategory) {
                                item.secondTitle = req.body.secondCategory
                              }
                            })
                          }
                          return totalCategory
                        })
                        .then((totalCategory) => {
                          if (req.body.third === 'true') {
                            specification.thirdCategory = req.body.thirdCategory
                            _.each(totalCategory.secondCategory, (item) => {
                              if (item.secondTitle === req.body.secondCategory) {
                                _.each(item.thirdTitles, (thirdItem) => {
                                  if (thirdItem.thirdTitle === req.body.originThirdCategory) {
                                    thirdItem.thirdTitle = req.body.thirdCategory
                                    thirdItem.thirdImages = req.body.thirdImages
                                  }
                                })
                              }
                            })
                          } else {
                            specification.thirdCategory = req.body.thirdCategory
                            _.each(totalCategory.secondCategory, (item) => {
                              if (item.secondTitle === req.body.secondCategory) {
                                _.each(item.thirdTitles, (thirdItem) => {
                                  if (thirdItem.thirdTitle === req.body.originThirdCategory) {
                                    thirdItem.thirdImages = req.body.thirdImages
                                  }
                                })
                              }
                            })
                          }
                          return totalCategory
                        })
                        .then((totalCategory) => {
                          return totalCategory
                        })
                })
                .then((final) => {
                  console.log('final')
                  console.log(specification)
                  db.specifications.findOneAndUpdate({
                    firstCategory: req.body.originFirstCategory
                  }, {
                    '$set': {
                      firstCategory: specification.firstCategory,
                      secondCategory: specification.secondCategory,
                      thirdCategory: specification.thirdCategory
                    }
                  }, (err, r) => {
                    if (err) return res.send(400, {succeed: false, msg: 'DBError'})
                  })
                  db.categorys.update({
                    firstCategory: req.body.originFirstCategory
                  }, {
                    '$set': {
                      firstCategory: final.firstCategory,
                      secondCategory: final.secondCategory
                    }
                  }, (err, result) => {
                    console.log('1231231232')
                    if (err) return res.send(400, {succeed: false, msg: 'DBError'})
                    res.send(200, {succeed: true, msg: 'ok'})
                  })
                })
                .catch((err) => {
                  res.send(err.statusCode, err.msg)
                })
        })
})
// German category
router.put('/category_manage_german', (req, res) => {
  console.log(req.body)
  db.specifications.findOne({
    de_firstCategory: req.body.originFirstCategory
  }, (err, specs) => {
    if (err) return res.send(500)
    let queryResult = new Promise((resolve, reject) => {
      db.categorys.findOne({de_firstCategory: req.body.originFirstCategory}, (err, result) => {
        if (err) reject(err)
        resolve(result)
      })
    })
    queryResult
            .then((totalCategory) => {
              if (totalCategory === null) throw {statusCode: 404, msg: 'Nut Found'}
              return new Promise((resolve, reject) => {
                if (req.body.first === 'true') {
                  totalCategory.de_firstCategory = req.body.firstCategory
                  specs.de_firstCategory = req.body.firstCategory
                }
                resolve(totalCategory)
              })
                    .then((total_Category) => {
                      if (req.body.second === 'true') {
                        specs.de_secondTitle = req.body.secondCategory
                        _.each(total_Category.secondCategory, (item) => {
                          if (item.de_secondTitle === req.body.originSecondCategory) {
                            item.de_secondTitle = req.body.secondCategory
                          }
                        })
                      }
                      return total_Category
                    })
                    .then((total_Category) => {
                      if (req.body.third === 'true') {
                        specs.de_thirdTitle = req.body.thirdCategory
                        _.each(total_Category.secondCategory, (item) => {
                          if (item.de_secondTitle === req.body.secondCategory) {
                            _.each(item.thirdTitles, (thirdItem) => {
                              if (thirdItem.de_thirdTitle === req.body.originThirdCategory) {
                                thirdItem.de_thirdTitle = req.body.thirdCategory
                                thirdItem.thirdImages = req.body.thirdImages
                              }
                            })
                          }
                        })
                      } else {
                        specs.de_thirdTitle = req.body.thirdCategory
                        _.each(total_Category.secondCategory, (item) => {
                          if (item.de_secondTitle === req.body.secondCategory) {
                            _.each(item.thirdTitles, (thirdItem) => {
                              if (thirdItem.de_thirdTitle === req.body.originThirdCategory) {
                                thirdItem.thirdImages = req.body.thirdImages
                              }
                            })
                          }
                        })
                      }
                      return total_Category
                    })
                    .then((total_Category) => {
                      return total_Category
                    })
            })
            .then((final) => {
              db.specifications.findOneAndUpdate({
                de_firstCategory: req.body.originFirstCategory
              }, {
                '$set': {
                  de_firstCategory: specs.de_firstCategory,
                  de_secondCategory: specs.de_secondCategory,
                  de_thirdCategory: specs.de_thirdCategory
                }
              }, (err, r) => {
                if (err || !r) return res.send(200, {succeed: false, msg: 'DBError'})
              })
              db.categorys.update({
                de_firstCategory: req.body.originFirstCategory
              }, {
                '$set': {
                  de_firstCategory: final.de_firstCategory,
                  secondCategory: final.secondCategory
                }
              }, (err, result) => {
                if (err || !result) return res.send(500, {succeed: false, msg: 'DBError'})
                res.send(200, {succeed: true, msg: 'ok'})
              })
            })
            .catch((err) => {
              res.send(err.statusCode, err.msg)
            })
  })
})

router.delete('/category_manage_german', (req, res) => {
  let [first, second, third] = [req.body.firstCategory, req.body.secondCategory, req.body.thirdCategory]
  let queryResult = new Promise((resolve, reject) => {
    db.categorys.findOne({de_firstCategory: first}, (err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
  queryResult
        .then((totalCategory) => {
          if (totalCategory === null) throw {statusCode: 404, msg: 'Nut Found'}
          return new Promise((resolve, reject) => {
            if (first && second === '' && third === '') {
              db.specifications.remove({
                de_firstCategory: first
              }, (err, result) => {
                if (err) throw Error()
              })
              totalCategory = ''
            }
            resolve(totalCategory)
          })
                .then((total_Category) => {
                  if (first && second && third === '') {
                    db.specifications.remove({
                      de_firstCategory: first,
                      de_secondCategory: second
                    }, (err, result) => {
                      if (err) throw Error()
                    })
                    _.each(total_Category.secondCategory, (item, key) => {
                      if (typeof item !== 'undefined') {
                        if (typeof item.de_secondTitle !== 'undefined' && item.de_secondTitle === second) {
                          totalCategory.secondCategory.splice(key, 1)
                        }
                      }
                    })
                  }
                  return total_Category
                })
                .then((total_Category) => {
                  if (first && second && third) {
                    db.specifications.remove({
                      de_firstCategory: first,
                      de_secondCategory: second,
                      de_thirdCategory: third
                    }, (err, result) => {
                      if (err) throw Error()
                    })
                    _.each(total_Category.secondCategory, (item) => {
                      if (item.de_secondTitle === second) {
                        _.each(item.thirdTitles, (thirdItem, key) => {
                          if (typeof thirdItem !== 'undefined') {
                            if (typeof thirdItem.de_thirdTitle !== 'undefined' && thirdItem.de_thirdTitle === third) {
                              delete item.thirdTitles.splice(key, 1)
                            }
                          }
                        })
                      }
                    })
                  }
                  return total_Category
                })
                .then((total_Category) => {
                  return total_Category
                })
        })
        .then((final) => {
          if (final === '') {
            db.categorys.remove({
              firstCategory: first
            }, (err, result) => {
              if (err || !result) return res.send(200, {succeed: false, msg: 'DBError'})
              res.send(200, {succeed: true, msg: 'ok'})
            })
          } else {
            db.categorys.update({
              de_firstCategory: first
            }, {
              '$set': {
                secondCategory: final.secondCategory
              }
            }, (err, result) => {
              if (err || !result) return res.send(200, {succeed: false, msg: 'DBError'})
              res.send(200, {succeed: true, msg: 'ok'})
            })
          }
        })
        .catch(err => {
          res.send(err.statusCode, err.msg)
        })
})

// 类目上传
router.get('/accessory_upload', checkLogin)
router.get('/accessory_upload', function (req, res, next) {
  console.log('类目管理' + new Date())
  res.render('admin/product/accessory-upload', {upload: [], username: u.nick_name})
  console.log('类目管理页面登陆成功')
})

router.post('/doAddCategory', checkLogin)
router.post('/doAddCategory', function (req, res) {
  var Categories = {
    firstCategory: req.body.firstCategory,
    de_firstCategory: req.body.de_firstCategory,
    firstUrl: req.body.firstUrl,
    de_firstUrl: req.body.de_firstUrl,
    firstCount: req.body.firstCount,
    secondCategory: JSON.parse(req.body.secondCategory)
  }
    // 保存到产品属性表
  var spec = {}
  if (JSON.parse(req.body.secondCategory).length != 0) {
    _.each(JSON.parse(req.body.secondCategory), function (second) {
      if (second.thirdTitles.length != 0) {
        _.each(second.thirdTitles, function (third) {
          spec = {
            firstCategory: req.body.firstCategory,
            secondCategory: second.secondTitle,
            thirdCategory: third.thirdTitle,
            de_firstCategory: req.body.de_firstCategory,
            de_secondCategory: second.de_secondTitle,
            de_thirdCategory: third.de_thirdTitle,
            specification: {},
            addBy: ''
          }
          let specs = new db.specifications(spec)
          console.log(spec)
          specs.save(err => {
            console.log(err)
          })
        })
      } else {
        spec = {
          firstCategory: req.body.firstCategory,
          secondCategory: second.secondTitle,
          thirdCategory: '',
          de_firstCategory: req.body.de_firstCategory,
          de_secondCategory: second.de_secondTitle,
          de_thirdCategory: '',
          specification: {},
          addBy: ''
        }
        let specs = new db.specifications(spec)
        console.log(spec)
        specs.save(err => {
          console.log(err)
        })
      }
    })
  } else {
    spec = {
      firstCategory: req.body.firstCategory,
      secondCategory: '',
      thirdCategory: '',
      de_firstCategory: req.body.de_firstCategory,
      de_secondCategory: '',
      de_thirdCategory: '',
      specification: {},
      addBy: ''
    }
    let specs = new db.specifications(spec)
    console.log(spec)
    specs.save(err => {
      console.log(err)
    })
  }

  var category = new db.categorys(Categories)
  category.save(err => {
    if (err) {
      res.send('fail')
    } else {
      res.send('success')
    }
  })
})

/* ------------------------------------------------------------------- */
/* ----------------------------最热标签管理 ------------------------- */
// 获取用户
router.get('/hotlabel', function (req, res, next) {
  console.log('当前分页' + req.query.iDisplayStart)
  db.hotLabels.find({}, null, {
    sort: {
      'registerTime': 1
    }
  }, function (err, result) {
    var lista = {
      'draw': 2,
      'recordsTotal': '',
      'recordsFiltered': '',
      'data': []
    }
    lista.recordsTotal = result.length
    lista.recordsFiltered = lista.recordsTotal
    lista.data = result
        // console.log(result);
    res.send(lista)
    res.end()
  })
})

/* ------------------------------------------------------------------- */
/* ----------------------------上传产品模块 ------------------------- */

// 上传产品
router.get('/upload', checkLogin)
router.get('/upload', function (req, res) {
  console.log('save history go -1')
  db.categorys.find({}, function (err, result) {
    if (err) res.send('404')
    res.render('admin/product/upload-goods', {
      username: u.nick_name,
      upload: [],
      category: result,
      tempCategory: req.session.tempCategory || [],
      specStatus: true
    })
  })
})

router.get('/upload-manage-draft', checkLogin)
router.get('/upload-manage-draft', function (req, res) {
  console.log('save change history go -1')
  db.categorys.find({}, function (err, result) {
    if (err) res.send('404')
    res.render('admin/product/upload-goods', {
      username: u.nick_name,
      upload: [],
      category: result,
      tempCategory: req.session.changeCategory || [],
      specStatus: true
    })
  })
})

router.post('/changeCategory', (req, res) => {
  console.log(JSON.parse(req.body.category))
  console.log('1111111')
  req.session.changeCategory = JSON.parse(req.body.category) || []
  res.send({succeed: true, page: '/admin/upload-manage-draft'})
})

// 上传产品详细信息
router.get('/upload-products-detail', (req, res, next) => {
  let spec_status = false
  let product_spec = {
    compatibility: [],
    type: [],
    hardOrSoft: [],
    features: [],
    Color: [],
    pattern: [],
    material: []
  }
  console.log(req.session.tempCategory)
  async.forEachOf(req.session.tempCategory, (item, key, callback) => {
    console.log(key)
    console.log(item)
    db.specifications.findOne({
      'thirdCategory': item.thirdCategory,
      'secondCategory': item.secondCategory
    }, (err, result) => {
      if (err) {
        res.send(500)
      } else {
        if (typeof result.specification !== 'undefined') {
          spec_status = true
          _.each(result.specification.compatibility, (item) => {
            product_spec.compatibility.push(item.value)
          })
          _.each(result.specification.type, (item) => {
            product_spec.type.push(item.value)
          })
          _.each(result.specification.hardOrSoft, (item) => {
            product_spec.hardOrSoft.push(item.value)
          })
          _.each(result.specification.features, (item) => {
            product_spec.features.push(item.value)
          })
          _.each(result.specification.Color, (item) => {
            product_spec.Color.push(item.value)
          })
          _.each(result.specification.pattern, (item) => {
            product_spec.pattern.push(item.value)
          })
          _.each(result.specification.material, function (item) {
            product_spec.material.push(item.value)
          })
        } else {
          spec_status &= false
          req.session.tempCategory.splice(key, 1)
        }
        callback()
      }
    })
  }, function (err) {
        // if any of the file processing produced an error, err would equal that error
    if (err) {
      res.send(500)
    } else {
      let spec = new Promise((resolve, reject) => {
        resolve({spec_status: spec_status, product_specs: product_spec})
      })

      let category = new Promise((resolve, reject) => {
        db.categorys.find({}, function (err, result) {
          if (err) reject(err)
          resolve(result)
        })
      })

      let suppliers = new Promise((resolve, reject) => {
        db.suppliers.find({}, (err, suppliers) => {
          if (err) reject(err)
          resolve(suppliers)
        })
      })

      Promise.all([spec, category, suppliers])
                .then(values => {
                  let [product_specs, category, suppliers] = values
                  let product_spec = product_specs.product_specs

                  console.log('----------')
                  console.log(product_specs.spec_status)
                  console.log('----------')
                  if (!product_specs.spec_status) {
                    db.categorys.find({}, function (err, result) {
                      if (err) return res.send('404')
                      return res.render('admin/product/upload-goods', {
                        username: u.nick_name,
                        upload: [],
                        category: result,
                        tempCategory: req.session.tempCategory || [],
                        specStatus: false
                      })
                    })
                  } else {
                    res.render('admin/product/upload-products-detail', {
                      username: u.nick_name,
                      upload: [],
                      category: category,
                      tempCategory: req.session.tempCategory,
                      suppliers: suppliers,
                      product_specification: {
                        compatibility: product_spec.compatibility,
                        type: product_spec.type,
                        hardOrSoft: product_spec.hardOrSoft,
                        features: product_spec.features,
                        pattern: product_spec.pattern,
                        Color: product_spec.Color,
                        material: product_spec.material
                      }
                    })
                    tempCategory = []
                  }
                })
                .catch((e) => {
                  console.log(e)
                  res.send(500, {succeed: false})
                })
    }
  })
})

function parseIsNull (args) {
  if (args.length === 0) {
    return false
  } else {
    return true
  }
}

function parseIsExist (arg) {
  if (typeof arg['compatibility'] === 'undefined' &&
        typeof arg['type'] === 'undefined' &&
        typeof arg['hardOrSoft'] === 'undefined' &&
        typeof arg['features'] === 'undefined' &&
        typeof arg['pattern'] === 'undefined' &&
        typeof arg['Color'] === 'undefined' &&
        typeof arg['material'] === 'undefined') {
    return false
  } else {
    return true
  }
}

function filterArr (spectication, tempCategory) {
  var newArr = _.filter(spectication, function (compatibility) {
    return tempCategory === compatibility.belong
  })
  return newArr
}

// 进入产品页面GET所以收藏类目
router.get('/uploadTemporary', function (req, res, next) {
  db.uploadTemporarys.find({'addBy': req.query.username}, null, {
    sort: {
      upload_time: -1
    }
  }, function (err, result) {
    if (err) {
      res.send({error_msg: ['INTERNAL SERVER ERROR'], info: '', result: 'fail', code: '500'})
    } else {
      console.log('get ')
      res.send({error_msg: [], info: result, result: 'success', code: '200'})
    }
  }).limit(5)
})

// 产品页面POST保存最近上传类目接口
router.post('/uploadTemporary', function (req, res, next) {
  if (req.body.firstCategory === '' && req.body.secondCategory != '') {
    res.send({error_msg: ['FORMAT PARAM Error'], info: '', result: 'fail', code: '400'})
  } else {
    let Categories = {
      firstCategory: req.body.firstCategory,
      secondCategory: req.body.secondCategory,
      thirdCategory: req.body.thirdCategory,
      addBy: req.body.addBy,
      upload_time: (new Date().getTime() / 1000).toFixed(),
      status: 'NEW'
    }
    console.log('typeof temp status: ' + typeof req.session.tempCategory)
    if (typeof req.session.tempCategory === 'undefined') {
      tempCategory.push(Categories)
      req.session.tempCategory = tempCategory
      let category = new db.uploadTemporarys(Categories)
      category.save(function (err) {
        console.log(err)
        if (err) {
          console.log(err)
          res.send({error_msg: ['INTERNAL SERVER ERROR'], info: '', result: 'fail', code: '500'})
        } else {
          db.uploadTemporarys.find({'addBy': req.body.addBy}, null, {
            sort: {
              upload_time: -1
            }
          }, function (err, result) {
            if (err) {
              res.send({
                error_msg: ['INTERNAL SERVER ERROR'],
                info: '',
                result: 'fail',
                code: '500'
              })
            } else {
              res.send({error_msg: [], info: result, result: 'success', code: '200'})
            }
          }).limit(5)
        }
      })
    } else {
      let temp = req.session.tempCategory
      async.forEachOf(temp, (i, index, callback) => {
        if (i.firstCategory != req.body.firstCategory ||
                    i.secondCategory != req.body.secondCategory ||
                    i.thirdCategory != req.body.thirdCategory) {
                    // temporary do not already exist so dismiss it
          callback()
        } else {
                    // temporary already exist so dismiss it
          callback('error')
        }
      }, (err) => {
                // error <null or error>
        console.log('upload temporary already exist')
        if (err) return res.send({error_msg: [], info: Categories, result: 'success', code: '200'})
                // need add temporary category into session

                // TODO DO NOT SUPPORT MUTIL UPLOAD
                // req.session.tempCategory.push(Categories)
                // let arrayLike = []
                // arrayLike.push(Categories)
        req.session.tempCategory.push(Categories)
        console.log(req.session.tempCategory)

                // report status
        console.log('upload temporary do not already exist')
        let category = new db.uploadTemporarys(Categories)
        category.save(err => {
          if (err) {
            return res.send({
              error_msg: ['INTERNAL SERVER ERROR'],
              info: '',
              result: 'fail',
              code: '500'
            })
          }
          db.uploadTemporarys.find({
            'addBy': req.body.addBy
          }, null, {
            sort: {
              upload_time: -1
            }
          }, (err, result) => {
            if (err) {
              return res.send({
                error_msg: ['INTERNAL SERVER ERROR'],
                info: '',
                result: 'fail',
                code: '500'
              })
            }
            console.log('upload temporary upload status success')
            res.send({error_msg: [], info: result, result: 'success', code: '200'})
          }).limit(5)
        })
      })
    }
  }
})

router.post('/deleteTemporary', (req, res) => {
  console.log(req.body.thirdCategory.trim())
  if (req.body.thirdCategory === '') return res.json({status: 403, msg: 'NOT FOUND'})
  tempCategory = _.filter(function (item) {
    return item.thirdCategory != req.body.thirdCategory
  })

  req.session.tempCategory = _.filter(req.session.tempCategory, item => {
    return item.thirdCategory != req.body.thirdCategory.trim()
  })
  console.log('delete success')
  console.log(req.session.tempCategory)

  res.json(201, {status: 200, msg: 'SUCCESS'})
})

// 点击上传产品跳转到产品详情页接口
router.post('/uploadProductDetail', function (req, res, next) {
  var Categories = []
  _.each(req.body, function (product) {
    if (product.firstCategory === '' && product.secondCategory != '') {
      res.send({error_msg: ['FORMAT PARAM Error'], info: '', result: 'fail', code: '400', username: u.nick_name})
    } else {
      var singleCategories = {
        firstCategory: product.firstCategory,
        secondCategory: product.secondCategory,
        thirdCategory: product.thirdCategory,
        addBy: u.nick_name,
        status: 'NEW'
      }
      Categories.push(singleCategories)
    }
  })

  db.specifications.find({}, function (err, product_spectication) {
    console.log(product_spectication)
    if (Categories.length != 0 && product_spectication.length != 0) {
      console.log({categories: Categories, product_specification: product_spectication})
      res.render('admin/product/upload-products-detail', {
        error_msg: [],
        info: {categories: Categories, product_specification: product_spectication},
        result: 'success',
        code: '200',
        username: u.nick_name
      })
    } else {
      res.send({error_msg: ['FORMAT PARAM Error'], info: '', result: 'fail', code: '400', username: u.nick_name})
    }
  })
})

// 保存详细产品
router.post('/saveProductDetail', function (req, res, next) {
  let data = {
    product_title: req.body.product_title,
    product_title_de: req.body.product_title_german,
    product_remark: req.body.product_remark,
    product_remark_de: req.body.product_remark_german,
    product_quantity: Number(req.body.product_quantity).toFixed(),
    product_id: (new Date().getTime()).toFixed(),
    product_supplier: req.body.product_supplier,
    product_sell_status: req.body.product_sell_status,
    product_stock_status: req.body.product_stock_status,
    product_video_link: req.body.product_video_link,
    belong_category: JSON.parse(req.body.belong_category),
    product_price: JSON.parse(req.body.product_price),
    product_danWei: JSON.parse(req.body.product_danWei)[0],
    product_market: JSON.parse(req.body.product_market)[0],
    product_images: JSON.parse(req.body.product_images),
    product_spec: JSON.parse(req.body.product_spec),
    update_time: new Date().getTime(),
    status: 'pending',
    operator: 'admin'
  }

  new db.products(data)
        .save((err, obj) => {
          if (err) return res.send(400, {succeed: false})
          let thirdCate = []
          _.each(data.belong_category, function (item) {
            thirdCate.push(item.third)
          })

          async.each(data.belong_category, (item, callback) => {
            db.categorys.findOne({'secondCategory.thirdTitles.thirdTitle': item.third}, (err, result) => {
              if (err || !result) return res.send(500)
              let newArr = _.filter(result.secondCategory, (secondCategory) => {
                return secondCategory.secondTitle === item.second
              })

              _.each(newArr[0].thirdTitles, (thirdCategory) => {
                if (thirdCategory.thirdTitle === item.third) {
                  thirdCategory.product.push(obj._id)
                }
              })

              console.log(newArr[0].thirdTitles)
              console.log(newArr[0].thirdTitles[0].product)
              console.log(newArr[0]._id)

              let _seoProcess = new Promise((resolve, reject) => {
                let seo = {
                  SEO_Name: data.product_title,
                  SEO_Url: '/single-product/' + data.product_id,
                  add_time: (new Date().getTime()).toFixed()
                }

                let SEO_V = new db.SEOS(seo)
                SEO_V.save((err) => {
                  if (err) {
                    reject(err)
                  } else {
                    resolve(true)
                  }
                })
              })

              _seoProcess
                        .then(() => {
                          db.categorys.findOneAndUpdate({
                            'secondCategory._id': newArr[0]._id
                          }
                                , {
                                  $set: {
                                    'secondCategory.$.thirdTitles': newArr[0].thirdTitles
                                  }
                                }, (err, result) => {
                                  if (err || !result) throw err
                                  callback()
                                })
                        })
            })
          }, (err) => {
            if (err) return res.send(500)
            res.send({succeed: true, msg: 'ok'})
          })
        })
})

// 保存草稿详细产品
router.put('/draft/saveProductDetail', (req, res) => {
  db.products.remove({'_id': req.body.product_id}, (err, result) => {
    console.log(err)
    if (err || !result) return res.send(500)
    let data = {
      product_title: req.body.product_title,
      product_title_de: req.body.product_title_german,
      product_remark: req.body.product_remark,
      product_remark_de: req.body.product_remark_german,
      product_quantity: Number(req.body.product_quantity).toFixed(),
      product_id: (new Date().getTime()).toFixed(),
      product_supplier: req.body.product_supplier,
      product_sell_status: req.body.product_sell_status,
      product_stock_status: req.body.product_stock_status,
      product_video_link: req.body.product_video_link,
      belong_category: JSON.parse(req.body.belong_category),
      product_price: JSON.parse(req.body.product_price),
      product_danWei: JSON.parse(req.body.product_danWei)[0],
      product_market: JSON.parse(req.body.product_market)[0],
      product_images: JSON.parse(req.body.product_images),
      product_spec: JSON.parse(req.body.product_spec),
      product_draft_status: false,
      update_time: new Date().getTime(),
      status: 'pending',
      operator: 'admin'
    }

    new db.products(data)
            .save((err, obj) => {
              if (err) return res.send(400, {succeed: false})
              res.send({succeed: true, msg: 'ok'})
            })
  })
})

/* ------------------------------------------------------------------- */
/* ----------------------------产品基本信息管理------------------------- */
// 产品基本信息录入管理
router.get('/specification', checkLogin)
router.get('/specification', function (req, res, next) {
  console.log('产品上传管理' + new Date())
  let payload = {}
  if (req.query.firstCategory) {
    payload.firstCategory = req.query.firstCategory
  }
  if (req.query.secondCategory) {
    payload.secondCategory = req.query.secondCategory
  }

  if (req.query.thirdCategory) {
    payload.thirdCategory = req.query.thirdCategory
  }
  db.specifications.find(payload, function (err, result) {
    db.categorys.find({}, function (err, data) {
      if (err) res.send('404')

      _.each(result, (i) => {
        if (typeof i.specification === 'undefined') {
          i.specification = {}
        }
      })
      res.render('admin/product/specifications-manage',
        {
          username: u.nick_name,
          category: data,
          specification: result,
          language: 'en'
        }
            )
    })
  })

  console.log('产品上传管理登陆成功')
})

router.get('/specification_german', checkLogin)
router.get('/specification_german', function (req, res, next) {
  console.log('产品上传管理' + new Date())
  console.log('产品上传管理' + new Date())
  let payload = {}
  if (req.query.firstCategory) {
    payload.de_firstCategory = req.query.firstCategory
  }
  if (req.query.secondCategory) {
    payload.de_secondCategory = req.query.secondCategory
  }

  if (req.query.thirdCategory) {
    payload.de_thirdCategory = req.query.thirdCategory
  }

  db.specifications.find(payload, function (err, result) {
    db.categorys.find({}, function (err, data) {
      if (err) res.send('404')

      _.each(result, (i) => {
        i.firstCategory = i.de_firstCategory || i.firstCategory
        i.secondCategory = i.de_secondCategory || i.secondCategory
        i.thirdCategory = i.de_thirdCategory || i.thirdCategory
        if (typeof i.specification === 'undefined') {
          i.specification = {}
        } else {
          _.each(i.specification, (m) => {
            if (typeof m.features !== 'undefined' || typeof m.type !== 'undefined' ||
                            typeof m.compatibility !== 'undefined' || typeof m.hardOrSoft !== 'undefined' ||
                            typeof m.pattern !== 'undefined' || typeof m.Color !== 'undefined' ||
                            typeof m.material !== 'undefined') {
              m.value = m.de_value || m.value
            }
          })
        }
      })

      console.log(result)

      res.render('admin/product/specifications-manage',
        {
          username: u.nick_name,
          category: data,
          specification: result,
          language: 'de'
        }
            )
    })
  })

  console.log('产品上传管理登陆成功')
})

// 产品基本信息录入管理-添加属性
router.post('/spec/property/add', function (req, res, next) {
  var date = new Date()
  var add_time = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
  var attribute = 'specification.' + req.body.addProperty
  db.specifications.update({'thirdCategory': req.body.belong},
    {
      '$pushAll': {
        [attribute]: [{
          'name': req.body.addProperty,
          'value': req.body.property,
          'de_value': req.body.de_property,
          'addTime': add_time
        }]
      }
    }, function (err, data) {
      if (err) res.json('500')
      res.send('200')
    })
})

// 产品基本信息录入管理-删除属性
router.post('/spec/property/delete', function (req, res, next) {
  console.log(req.body)
  var attribute = 'specification.' + req.body.name
  let queryLoad = {}
  let setLoad = {}
  if (req.body.language === 'en') {
    queryLoad = {'thirdCategory': req.body.belong}
    setLoad = {
      'name': req.body.name,
      'value': req.body.value
    }
  } else {
    queryLoad = {'de_thirdCategory': req.body.belong}
    setLoad = {
      'name': req.body.name,
      'de_value': req.body.value
    }
  }
  console.log(queryLoad)
  console.log(setLoad)
  db.specifications.update(queryLoad,
    {
      '$pull': {
        [attribute]: setLoad
      }
    }, function (err, data) {
      if (err) res.json('500')
      res.send('200')
    })
})

/* ------------------------------------------------------------------- */
/* ----------------------------供应商管理------------------------------ */
// 获取供应商
router.get('/supplierList', function (req, res, next) {
  console.log('当前分页' + req.query.iDisplayStart)
  db.suppliers.find({name: {$ne: '请选择'}}, null, {
    sort: {
      'add_time_number': 1
    }
  }, function (err, result) {
    var lista = {
      'draw': 2,
      'recordsTotal': '',
      'recordsFiltered': '',
      'data': []
    }
    lista.recordsTotal = result.length
    lista.recordsFiltered = lista.recordsTotal
    lista.data = result
    res.send(lista)
    res.end()
  })
})
router.get('/supplier_manage', checkLogin)
router.get('/supplier_manage', function (req, res, next) {
  res.render('admin/product/supplier-manage',
    {
      username: u.nick_name
    }
    )
})

// check login state
router.post('/doAddSupplier', checkLogin)
/**
 * add supplier infomation
 * @param  {[type]} req           [description]
 * @param  {[type]} res)          [description]
 * @param  {[type]} options.$inc: {'supplier_id': 1}           [description]
 * @param  {[type]} (err,         data)            [description]
 * @return {[type]}               [description]
 */
router.post('/doAddSupplier', function (req, res) {
    // query supplier id
  db.suppliers.findOneAndUpdate(
        {'name': '请选择'},
        {$inc: {'supplier_id': 1}}, (err, data) => {
          var suppliers = {
            name: req.body.add_name,
            add_location: req.body.add_by,
            supplier_id: data.supplier_id,
            add_time: req.body.add_time,
            add_time_number: req.body.add_time_number
          }
          var supplier = new db.suppliers(suppliers)
          supplier.save(function (err) {
            if (err) {
              res.send({
                error_msg: ['FORMAT PARAM Error'],
                info: '',
                result: 'FAILED',
                code: '500',
                username: u.nick_name
              })
            }
          })
          res.send({
            error_msg: [''],
            info: '',
            result: 'SUCCESS',
            code: '200',
            username: u.nick_name
          })
        })
})

// check login state
router.post('/doChangeSupplier', checkLogin)
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
        add_time: Utils.DateTime.FormatDate()
      }
    }, function (err, result) {
      if (err) {
        res.send({
          error_msg: ['FORMAT PARAM Error'],
          info: '',
          result: 'FAILED',
          code: '500',
          username: u.nick_name
        })
      } else {
        res.send({
          error_msg: [''],
          info: '',
          result: 'SUCCESS',
          code: '200',
          username: u.nick_name
        })
      }
    })
  } else {
    res.send({
      error_msg: ['FORMAT PARAM Error'],
      info: '',
      result: 'FAILED',
      code: '500',
      username: u.nick_name
    })
  }
})
// check login state
router.post('/doDelSuppler', checkLogin)
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
      if (err) {
        res.send({
          error_msg: ['FORMAT PARAM Error'],
          info: '',
          result: 'FAILED',
          code: '500',
          username: u.nick_name
        })
      }
      res.send({error_msg: [''], info: '', result: 'SUCCESS', code: '200', username: u.nick_name})
    })
  } else {
    res.send({
      error_msg: ['FORMAT PARAM Error'],
      info: '',
      result: 'FAILED',
      code: '500',
      username: u.nick_name
    })
  }
})

/* ------------------------------------------------------------------- */
/* ------------------------------图片上传------------------------------ */

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({
  storage: storage
})
router.post('/uploadSingle', upload.array('file'), function (req, res, next) {
  console.log(req.files)
  if (req.files === undefined) {
    res.send('请选择要上传的图片...')
  } else {
    var str = '文件上传成功...'
    var uploadArr = []
    for (var i = 0; i < req.files.length; i++) {
      var filepath = './public/images/' + req.files[i].originalname
      var vitualPath = '/images/' + req.files[i].originalname
      fs.renameSync(req.files[i].path, filepath)

      uploadArr.push(vitualPath)
    }
    console.log(req.files.length)
    console.log(uploadArr)
    res.json({
      code: 200,
      data: uploadArr
    })
  }
})

/* 多图片上传 */
router.post('/uploadImage', upload.array('file'), function (req, res, next) {
  console.log(req.files)
  if (req.files === undefined) {
    res.send('请选择要上传的图片...')
  } else {
    var str = '文件上传成功...'
    var uploadArr = []
    for (var i = 0; i < req.files.length; i++) {
      var filepath = './public/images/' + req.files[i].originalname
      fs.renameSync(req.files[i].path, filepath)

      var savePath = req.files[i].originalname
      uploadArr.push(savePath)
    }
    res.send(uploadArr[0])
  }
})

/* 上传表格解析 */
var storage_file = multer.diskStorage({ // multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, './public/crawler_file')
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now()
    cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
  }
})
var uploads = multer({ // multer settings
  storage: storage_file,
  fileFilter: function (req, file, callback) { // file filter
    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
      return callback(new Error('Wrong extension type'))
    }
    callback(null, true)
  }
}).single('file')
router.post('/uploadFile', function (req, res, next) {
  let exceltojson
  uploads(req, res, function (err) {
    if (err) {
      res.json({error_code: 1, err_desc: err})
      return
    }
        /** Multer gives us file info in req.file object */
    if (!req.file) {
      res.json({error_code: 1, err_desc: 'No file passed'})
      return
    }
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
    if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
      exceltojson = xlsxtojson
    } else {
      exceltojson = xlstojson
    }
    console.log(exceltojson)
    console.log(req.file.path)
    try {
      exceltojson({
        input: req.file.path,
        output: null, // since we don't need output.json
        lowerCaseHeaders: true
      }, function (err, result) {
        if (err) {
          return res.json({error_code: 1, err_desc: err, data: null})
        }
        console.log(result)
        res.json({error_code: 0, err_desc: null, data: result})
      })
    } catch (e) {
      res.json({error_code: 1, err_desc: 'Corupted excel file'})
    }
  })
})

/* -------------------------------------------------------------------------- */

/* -----------------------------------爬虫管理-------------------------------- */
/* 爬虫 */
router.get('/crawler', (req, res, next) => {
  superagent.get(req.query.link)
        .end(function (err, result) {
          if (err) {
            return next(err)
          }
          let $ = cheerio.load(result.text)
          let items = []
          let img = []
          let property = []
          let title = null

            /*
             handle image obj
             */
          $('.list').find('li').each(function (idx, element) {
            let url = $(this).find('img').attr('src')
            let uniqueUrl = url.substring(url.lastIndexOf('/') + 1)
            http_origin.get(url, function (res) {
              let imgData = ''

              res.setEncoding('binary')

              res.on('data', (chunk) => {
                imgData += chunk
              })

              let Rand = Math.random()
              let save_url = config.savePath + uniqueUrl
              img.push(save_url)
              res.on('end', function () {
                fs.writeFile(save_url, imgData, 'binary', function (err) {
                            // console.log(save_url);
                  if (err) {
                    console.log(err)
                  }
                })
              })
            })

            items.push({
              image_id: idx,
              image_url: '/images/crawler_image/' + uniqueUrl,
              image_title: $(this).find('img').attr('title')
            })
          })

          $('.specTitle').find('tr').each((idx, element) => {
            property.push({
              pro: $(element).find('th').text(),
              value: $(element).find('td').text()
            })
          })

          title = $('.prod-info-title').find('h1').text()

          let allItems = {
            title: title.substring(0, title.indexOf('#')),
            img: items,
            property: property
          }
          res.send(allItems)
        })
})

router.get('/crawler_manage', (req, res) => {
  res.render('admin/crawler/crawler', {username: u.nick_name})
})
router.get('/product-manage', (req, res) => {
  res.render('admin/product/product-manage', {username: u.nick_name})
})

router.get('/product-draft', (req, res) => {
  res.render('admin/product/product-draft', {username: u.nick_name})
})
// 产品管理详情页
router.get('/change-product', (req, res) => {
  req.session.product_id = req.query.product_id
  res.send('product-manage-detail')
})

router.get('/product-manage-detail', (req, res) => {
  db.products.findOne({_id: req.session.product_id}, (err, product) => {
    console.log(product)
    product.username = u.nick_name
    db.suppliers.find({}, (err, suppliers) => {
      product.suppliers = suppliers
      res.render('admin/product/product-manage-detail', product)
    })
  })
})

router.post('/crawler_manage', (req, res) => {
  console.log(req.body)
  let payload = {
    username: u.nick_name,
    title: req.body.title,
    upload: [],
    images: req.body['img[]'],
    category: req.session.category,
    product_specification: {
      compatibility: typeof req.body['compatibility[]'] === 'string' ? req.body['compatibility[]'].split(',') : req.body['compatibility[]'],
      type: typeof req.body['type[]'] === 'string' ? req.body['type[]'].split(',') : req.body['type[]'],
      hardOrSoft: typeof req.body['hardOrSoft[]'] === 'string' ? req.body['hardOrSoft[]'].split(',') : req.body['hardOrSoft[]'],
      features: typeof req.body['features[]'] === 'string' ? req.body['features[]'].split(',') : req.body['features[]'],
      pattern: typeof req.body['pattern[]'] === 'string' ? req.body['pattern[]'].split(',') : req.body['pattern[]'],
      Color: typeof req.body['color[]'] === 'string' ? req.body['color[]'].split(',') : req.body['color[]'],
      material: typeof req.body['material[]'] === 'string' ? req.body['material[]'].split(',') : req.body['material[]']
    }
  }

  req.session.payload = payload
  res.send(200, {succeed: true, page: '/admin/crawler-products-detail'})
})

router.get('/crawler-products-detail', (req, res) => {
  let payload = req.session.payload
  db.suppliers.find({}, (err, data) => {
    payload.suppliers = data
    console.log(payload)
    res.render('admin/crawler/crawler-products-detail', payload)
  })
})

/* ------------------------------------------------------------------------- */

/* ---------------------------------运费模板管理------------------------------ */

router.get('/shopping_template', (req, res) => {
  res.render('admin/templates/shopping-templates', {username: u.nick_name})
})

router.get('/template', (req, res) => {
  let payload = {_id: req.query.id || ''}
  let type = req.query.type || 'parcel'
  db.feeExpressCountry.findOne(payload, (err, data) => {
    if (err) return res.send(500, {succeed: false, msg: 'internal error'})
    req.session.express_tempalte = data
    req.session.express_tempalte_type = type

    res.send(200, {succeed: true, page: '/admin/express-fee-template'})
  })
})

router.put('/template', (req, res) => {
  let payload = {_id: req.body.id || ''}
  if (!payload._id) return res.send(400, {succeed: false, msg: 'internal error'})
  db.feeExpressCountry.remove(payload, (err, data) => {
    if (err) return res.send(500, {succeed: false, msg: 'internal error'})
    res.send(200, {succeed: true, msg: 'ok'})
  })
})

router.put('/fee/template', (req, res) => {
  let payload = {_id: req.body.id || ''}
  if (!payload._id || !req.body.type) return res.send(400, {succeed: false, msg: 'internal error'})
  payload.type = req.body.type
  db.feeExpress.remove(payload, (err, data) => {
    if (err) return res.send(500, {succeed: false, msg: 'internal error'})
    res.send(200, {succeed: true, msg: 'ok'})
  })
})

router.get('/express-fee-template', (req, res) => {
  console.log(u.nick_name)
  req.session.express_tempalte.username = u.nick_name || 'admin'
  req.session.express_tempalte.type = req.session.express_tempalte_type
  console.log(req.session.express_tempalte)
  if (req.session.express_tempalte_type === 'parcel') {
    res.render('admin/templates/parcel-change', req.session.express_tempalte)
  } else {
    res.render('admin/templates/express-ordinary-change', req.session.express_tempalte)
  }
})

router.get('/express_fee_template', (req, res) => {
  res.render('admin/templates/express-fee-templates', {username: u.nick_name})
})

router.get('/fee-express', (req, res) => {
  let country = []
  let payload = {}
  if (req.query.type) {
    payload.type = req.query.type
  }
  db.feeExpress
        .find(payload)
        .populate('country')
        .exec((err, data) => {
          if (err) return customError(500, '数据库查询错误', res)
          res.send(200, {succeed: true, msg: data})
        })
})

router.post('/fee-express', (req, res) => {
  let payload = JSON.parse(req.body.data)
  let query = {
    type: payload.type,
    country: payload.country,
    discount: Number(payload.discount) || 0,
    fuel_cost: Number(payload.fuel_cost) || 0
  }

  let opts = new Promise((resolve, reject) => {
    db.feeExpress.find({
      type: payload.type
    }, (err, data) => {
      if (err) reject(data)
      resolve(data)
    })
  })

  opts
        .then((d) => {
          if (d.length === 0) {
            let fee = new db.feeExpress(query)
            fee.save((err) => {
              if (err) throw {status: 500}
              res.send(201, {succeed: true, msg: 'add success'})
            })
          } else {
            console.log(query.country)
            async.forEach(query.country, (item, callback) => {
              db.feeExpress.findOneAndUpdate({
                type: payload.type
              }, {
                $push: {
                  country: item
                }
              }, (err, data) => {
                console.log(err)
                console.log(data)
                callback()
              })
            }, (err) => {
              console.log(err)
              if (err) throw {status: 500}
              res.send(200, {succeed: true, msg: 'add success'})
            })
          }
        })
        .catch((err) => {
          console.log(err)
          return res.send(500, {succeed: false, msg: 'internal error'})
        })
})

router.post('/fee-express-country', (req, res) => {
  console.log(req.body)
  let payload = JSON.parse(req.body.data)
  if (!payload) return res.send(500, {succeed: false, msg: 'param error'})
  let fee = new db.feeExpressCountry(payload)
  fee.save((err, docsInserted) => {
    console.log(err)
    if (err || !docsInserted) return res.send(500, {succeed: false, msg: 'internal error'})
    res.send(200, {succeed: true, msg: {countryId: docsInserted._id}})
  })
})

router.put('/fee-express-country', (req, res) => {
  console.log(req.body)
  let payload = JSON.parse(req.body.data)
  if (!payload) return res.send(500, {succeed: false, msg: 'param error'})
  db.feeExpressCountry.remove({_id: payload._id}, (err, d_data) => {
    console.log(d_data)
    if (err) return new customError(500, 'param error', res)
    delete payload._id
    let fee = new db.feeExpressCountry(payload)
    fee.save((err, docsInserted) => {
      if (err || !docsInserted) return res.send(500, {succeed: false, msg: 'internal error'})
      res.send(200, {succeed: true, msg: {countryId: docsInserted._id}})
    })
  })
})
router.put('/fee-parcel-country', (req, res) => {
  console.log(req.body)
  let payload = JSON.parse(req.body.data)
  if (!payload) return res.send(500, {succeed: false, msg: 'param error'})
  db.feeExpressCountry.findOneAndUpdate({_id: payload._id}, {
    $set: {
      country_name: payload.country_name,
      transport_fees: payload.transport_fees,
      registered_fee: payload.registered_fee,
      free_ship: payload.free_ship,
      expected_delivery: payload.expected_delivery
    }
  }, (err, d_data) => {
    if (err) return res.send(500, {succeed: false, msg: 'param error'})
    res.send(200, {succeed: true, msg: 'ok'})
  })
})

router.put('/fee-template', (req, res) => {
  res.send(200, {succeed: true, msg: 'put success'})
})

router.delete('/fee-template', (req, res) => {
  res.send(200, {succeed: true, msg: 'delete success'})
})

/**
 * ROUTER FEE  GET Method
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.get('/fee_manage', (req, res) => {
  db.feeCountrys.find({
    country_status: true
  }, (err, country) => {
    console.log(country)
    if (err) res.end(500, {succeed: false, msg: 'DB Error'})
    res.render('admin/templates/fee-manage', {username: u.nick_name, feeCountryList: country})
  })
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
  const fee = new db.fee(req.body)
  fee.save(function (err) {
    if (err) res.send(500, {succeed: false, msg: 'Internal Server Error'})
  })
  db.feeCountrys.update({
    country_name: req.body.country_name
  }, {
    $set: {
      country_status: false
    }
  }, (err, status) => {
    console.log(status)
    console.log('---')
    if (err) res.end(500, {succeed: false, msg: 'Internal Server Error'})
    res.send(200, {succeed: true, msg: 'success'})
  })
})

/**
 * ADD DELTA PRICE POST Method
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.post('/delta-price', (req, res) => {
  console.log(req.body)
  if (!req.body) res.end(401, {succeed: false, msg: 'Invalid Param Request'})
  const delta_price = new db.deltaPrice(req.body)
  delta_price.save(function (err) {
    if (err) res.end(500, {succeed: false, msg: 'Internal Server Error'})
  })
  res.send(200, {succeed: true, msg: 'success'})
})

/**
 * Modify DELTA PRICE PUT Method
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.put('/delta-price', (req, res) => {
  if (!req.body) res.end(401, {succeed: false, msg: 'Invalid Param Request'})
  db.deltaPrice.findOneAndUpdate({_id: req.body.id},
    {
      $set: {
        delta_price: req.body.delta_price,
        update_time: req.body.update_time
      }
    },
        (err, data) => {
          if (err) res.end(500, {succeed: false, msg: 'Internal Server Error'})
          res.send({succeed: true, msg: 'success'})
        })
})

/**
 * Delete FEE DEL Method
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.delete('/fee', (req, res) => {
  console.log(req.body)
  db.fee.remove({
    _id: req.body.id
  }, (err, data) => {
    if (err) res.end(500, {succeed: false, msg: 'Internal Server Error'})
    db.feeCountrys.update({
      country_name: req.body.country_name
    }, {
      $set: {
        country_status: false
      }
    }, (err, result) => {
      if (err) res.end(500, {succeed: false, msg: 'Internal Server Error'})
      res.send({succeed: true, msg: 'success'})
    })
  })
})

/**
 * Modify FEE PUT Method
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.put('/fee', (req, res) => {
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
        (err, data) => {
          if (err) res.end(500, {succeed: false, msg: 'Internal Server Error'})
          res.send({succeed: true, msg: 'success'})
        })
})

/**
 * GET FEE LIST
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.get('/feelist', (req, res, next) => {
  console.log(`current display page: ${req.query.iDisplayStart}`)
  db.fee.find({}, null, {
    sort: {
      'update_time_sort': -1
    }
  }, function (err, result) {
    if (err) next(customError(err.status, err, res))
    result.forEach((item) => {
      return item.country_fee = '1' + item.country_name + ' =' + item.country_fee + ' 人民币'
    })

    var lista = {
      'draw': 2,
      'recordsTotal': '',
      'recordsFiltered': '',
      'data': []
    }
    lista.recordsTotal = result.length
    lista.recordsFiltered = lista.recordsTotal
    lista.data = result
    res.send(lista)
    res.end()
  })
})
/**
 * GET FEE LIST
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.get('/feedollarlist', (req, res, next) => {
  console.log(`current display page: ${req.query.iDisplayStart}`)
  db.fee.find({}, null, {
    sort: {
      'update_time_sort': -1
    }
  }, function (err, result) {
    if (err) next(customError(err.status, err, res))
    var dollar_fee = result.filter((item) => {
      return item.country_name === '美元'
    })[0].country_fee

    var dollarArr = result
            .filter((item) => {
              return item.country_name != '美元'
            })
    dollarArr
            .forEach((item) => {
              item.country_fee = formatFee(1 / item.country_fee * dollar_fee)
              return item.country_fee = '1 美元 = ' + item.country_fee + ' ' + item.country_name
            })

    var lista = {
      'draw': 2,
      'recordsTotal': '',
      'recordsFiltered': '',
      'data': []
    }
    lista.recordsTotal = result.length
    lista.recordsFiltered = lista.recordsTotal
    lista.data = dollarArr
    res.send(lista)
    res.end()
  })
})

function formatFee (args) {
  let num = Number(args)
  let bb = num + ''
  let dian = bb.indexOf('.')
  let result = ''
  if (dian === -1) {
    result = num.toFixed(4)
  } else {
    let cc = bb.substring(dian + 1, bb.length)
    if (cc.length >= 5) {
      result = (Number(num.toFixed(4)) + 0.01) * 100000000000 / 100000000000// js小数计算小数点后显示多位小数
    } else {
      result = num.toFixed(4)
    }
  }
  return result
}

/**
 * [Description]
 * @param req  incoming request format
 * @param res  incoming request format
 * @param next render value
 * @return [type]
 */
router.post('/transport', (req, res) => {
  if (req.body.weight === 'undefined' || req.body.area === 'undefined') {
    res.send(401, {code: 401, msg: 'Params Error'})
    return
  }

  if (req.body.weight === '' || req.body.area === '') {
    res.send(401, {code: 401, msg: 'Params Error'})
    return
  }

  var weight = Number(req.body.weight)
  console.log('weight : %d', weight)
  var area = req.body.area
  var execution_weight = 0
  var express_price = 0
  var ordinary_price = 0
  var little_packet_price = 0
  var little_packet_weight = 0
  var ordinary_weight = 0
  var decimal_weight = weight - Math.floor(weight)
    // 特快处理
  if (weight < 0.5) {
    execution_weight = 0.5
  } else {
    if (decimal_weight < 0.5) {
      decimal_weight = 0.5
    } else {
      decimal_weight = 1
    }
  }
  execution_weight = execution_weight + decimal_weight

    // 普快处理
  var ordinary_length = weight.toString().substring(weight.toString().indexOf('.') + 1, weight.toString().length).length
  if (ordinary_length > 1) {
    ordinary_weight = Math.ceil(weight * 10) / 10
  }
  ordinary_weight = weight

    // 小包处理
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
        express: {price: express_price, msg: '特快快递'},
        ordinary: {price: ordinary_price, msg: '普通快递'},
        little_packet: {price: little_packet_price, msg: '小包'}
      })
    } else if (weight < 21) {
      express_price = getTransportPrice(express_conf, execution_weight, area)
      ordinary_price = getTransportPrice(oridinary_conf, ordinary_weight, area)
      console.log(ordinary_price)
      console.log(express_price)
      res.send(200, {
        express: {price: express_price, msg: '特快快递'},
        ordinary: {price: ordinary_price, msg: '普通快递'}
      })
    } else {
      var origin_weight = ''
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
        ordinary: {price: ordinary_price, msg: '普通快递'}
      })
    }
  } catch (e) {
    console.log(e)
    res.send(404, {code: 404, msg: 'NOT FOUND'})
  }
})

/**
 * calculate express/ordinary transport price
 * @param type translate conf
 * @param weight
 * @returns {number}
 */
function getTransportPrice (type, weight, area) {
  console.log('area:' + area)
  console.log('type: %d,weight: %d', type, weight)
  return parseInt(type.data.filter((item) => {
    return item.zh.indexOf(area) > -1
  })[0][weight.toString()]) * weight
}
/**
 * calculate ordinary translate price when weight bigger then 20
 * @param type
 * @param origin_weight
 * @param weight
 * @param area
 * @returns {number}
 */
function getOrdinaryTransportPrice (type, origin_weight, weight, area) {
  console.log('area:' + area)
  console.log('type: %d,weight: %d', type, weight)
  return parseInt(type.data.filter((item) => {
    return item.zh.indexOf(area) > -1
  })[0][origin_weight]) * weight
}
/**
 * calculate little transport price
 * @param type
 * @param weight
 * @returns {Number}
 */
function getLittleTransportPrice (type, weight) {
  console.log('type: %d,weight: %d', '小包', weight)
  return parseInt(type.data.filter((item) => {
    return item['kg'].indexOf(weight.toString()) > -1
  })[0]['fee']) * weight
}

router.get('/country', (req, res) => {
  if (!req.query.type) return res.send(401, {succeed: false, msg: 'invalid params'})
  let status = req.query.status || 'all'
  let payload = {type: req.query.type}
  if (status != 'all') {
    payload['countryLists.country_status'] = status === 'true'
  }
  console.log(payload)
  db.countryFlags.findOne(payload, (err, data) => {
    if (err) return res.send(500, {succeed: true, msg: 'internal error'})
    if (data.length === 0) return res.send(404, {succeed: false, msg: 'NOT EXIST'})
    res.send(200, {succeed: true, msg: data.countryLists})
  })
})

router.put('/country', (req, res) => {
  let payload = JSON.parse(req.body.data)
  db.countryFlags.find({
    type: payload.type
  }, (err, data) => {
    data[0].countryLists.forEach((e) => {
      payload.code.forEach((c) => {
        if (e.country_cn_name === c) {
          e.country_status = true
        }
      })
    })
    db.countryFlags.update({type: payload.type}, {
      $set: {
        countryLists: data[0].countryLists
      }
    }, (err, data) => {
      if (err) return res.send(500, {succeed: true, msg: 'internal error'})
      res.send(200, {succeed: true, msg: 'ok'})
    })
  })
})

router.get('/demo', (req, res) => {
  res.render('admin/product/product-national-flags-demo', {username: u.nick_name})
})

/* ------------------------------------------------------------------------ */

module.exports = router
