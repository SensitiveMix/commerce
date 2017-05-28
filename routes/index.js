const express = require('express')
const router = express.Router()
const db = require('../model/index')
const crypto = require('crypto')
const async = require('async')
const _ = require('lodash')

var hotLabel = []
var categoryies = []

function customError (code, msg, response) {
  response.send(code, msg)
}

var checkCategories = function (req, res, next) {
  if (categoryies.length === 0) {
    db.categorys.find({}, function (err, result) {
      if (err) res.send('404')
      categoryies = result
    })
  } else if (hotLabel.length === 0) {
    db.hotLabels.find({}, null, {
      sort: {
        add_time: -1
      }
    }, function (err, labels) {
      if (err) res.send(err)
      hotLabel = labels
    })
  }
  next()
}

/* GET home page. */
router.get('/', (req, res) => {
  async.parallel([
      done => {
        db.categorys
          .find({})
          .populate('secondCategory.thirdTitles.product')
          .exec((err, data) => {
            if (err) return customError(500, '数据库查询错误', res)
            categoryies = data
            done(err, data)
          })
      },
      done => {
        db.hotLabels
          .find({})
          .exec((err, label) => {
            if (err) return customError(500, '数据库查询错误', res)
            done(err, label)
          })
      }
    ],
    (err, response) => {
      if (err) return customError(500, '数据库查询错误', res)
      let category = response[0]
      let labels = response[1]
      let account = null
      let statusCode = 500
      if (req.cookies['account'] !== null) {
        account = req.cookies['account']
        statusCode = 200
      }

      console.log(labels)
      res.render('assets/index/en', {
        title: 'ECSell',
        url: '/',
        categories: category,
        hotLabels: labels,
        user: account,
        status: statusCode,
        language: 'English'
      })
    })
})

router.get('/login', (req, res, next) => {
  async.parallel([
      (done) => {
        db.categorys.find({}, function (err, result) {
          if (err) res.send('404')
          categoryies = result
          done(err, result)
        })
      },
      (done) => {
        db.hotLabels.find({}, null, {
          sort: {
            add_time: -1
          }
        }, function (err, labels) {
          hotLabel = labels
          done(err, labels)
        })
      }
    ],
    (err, results) => {
      if (err) {
        done(err)
      } else {
        var category = results[0]
        var labels = results[1]
        var account = null
        var statusCode = 500
        console.log(category)
        if (req.cookies['account'] !== null) {
          account = req.cookies['account']
          statusCode = 200
        }
        res.render('assets/login', {
          title: 'ECSell',
          categories: category,
          hotLabels: labels,
          user: account,
          status: statusCode
        })
      }
    })
})

// 登出处理
router.get('/logout', (req, res, next) => {
  res.clearCookie('account')
  res.redirect('/login')
})
// 验证邮件
router.post('/validateEmail', (req, res, next) => {
  db.users.find({name: req.body.email}, (err, result) => {
    if (err) {
      res.end('500')
    } else {
      if (result.length > 0) {
        res.send('401')  // email has exist
      } else {
        res.send('200')
      }
    }
  })
})
// person center
router.get('/personal-center', checkCategories)
router.get('/personal-center', (req, res, next) => {
  var statusCode = null
  if (req.cookies['account'] !== null) {
    statusCode = 200
  } else {
    statusCode = 500
  }
  console.log(req.cookies['account'])
  res.render('assets/personal-center', {
    title: 'ECSell',
    categories: categoryies,
    hotLabels: hotLabel,
    user: req.cookies['account'],
    status: statusCode
  })
})

router.get('/personal-Order', checkCategories)
router.get('/personal-Order', (req, res, next) => {
  var statusCode = null
  if (req.cookies['account'] !== null) {
    statusCode = 200
  } else {
    statusCode = 500
  }
  console.log(req.cookies['account'])
  res.render('assets/Personal-Order', {
    title: 'ECSell',
    categories: categoryies,
    hotLabels: hotLabel,
    user: req.cookies['account'],
    status: statusCode
  })
})

router.post('/change-profile', (req, res, next) => {
  console.log(req.body)
  db.users.update({'nick_name': req.body.origin_nick_name}, {
    $set: {
      nick_name: req.body.new_nick_name,
      company: req.body.customers_company,
      sex: req.body.gender
    }
  }, (err, result) => {
    if (err) {
      res.send(404)
    } else {
      var changeCode = null
      var statusCode = null
      if (result.nModified === 0) {
        res.send({account: '', code: 500, msg: 'CHANGE FAILED'})
      } else {
        if (req.cookies['account'] !== null) {
          var name = req.cookies['account'].name
          var level = req.cookies['account'].level
          res.clearCookie('account')
          res.cookie('account', {
            name: name,
            nick_name: req.body.new_nick_name,
            company: req.body.customers_company,
            sex: req.body.gender
          })
          req.cookies['account'].name = name
          req.cookies['account'].nick_name = req.body.new_nick_name
          req.cookies['account'].company = req.body.customers_company
          req.cookies['account'].sex = req.body.gender
          req.cookies['account'].level = level
          res.send({account: req.cookies['account'], code: 200, msg: 'SUCCESS'})
        } else {
          res.send({account: '', code: 500, msg: 'Not LOGIN'})
        }
      }
    }
  })
})

router.post('/change-email', (req, res, next) => {
  db.users.update({name: req.body.old_name, password: md5(req.body.existing_password)}, {
    $set: {
      name: req.body.newEmail
    }
  }, function (err, result) {
    if (err) {
      res.send(404)
    } else {
      console.log(result)
      var changeCode = null
      if (result.nModified === 0) {
        res.send({account: '', code: 500, msg: 'CHANGE FAILED'})
      } else {
        if (req.cookies['account'] !== null) {
          var name = req.body.newEmail
          var nick_name = req.cookies['account'].nick_name
          var company = req.cookies['account'].company
          res.clearCookie('account')
          res.cookie('account', {
            name: name,
            nick_name: nick_name,
            company: company,
            sex: req.body.gender
          })
          req.cookies['account'].name = req.body.newEmail
          console.log(req.cookies['account'])
          res.send({account: req.cookies['account'], code: 200, msg: 'SUCCESS'})
        } else {
          res.send({account: '', code: 500, msg: 'Not LOGIN'})
        }
      }
    }
  })
})

router.post('/change-password', (req, res, next) => {
  console.log(req.body)
  db.users.update({name: req.body.old_name, password: md5(req.body.existing_password_1)}, {
    $set: {
      password: md5(req.body.login_password_twice)
    }
  }, function (err, result) {
    if (err) {
      res.send(404)
    } else {
      console.log(result)
      var changeCode = null
      if (result.nModified === 0) {
        res.send({account: '', code: 500, msg: 'CHANGE FAILED'})
      } else {
        if (req.cookies['account'] !== null) {
          res.send({account: req.cookies['account'], code: 200, msg: 'SUCCESS'})
        } else {
          res.send({account: '', code: 500, msg: 'Not LOGIN'})
        }
      }
    }
  })
})

router.post('/change-address', (req, res, next) => {
  console.log(req.body)
  db.users.update({name: req.body.name}, {
    $set: {
      areaCode: req.body.areaCode,
      detailAddress: req.body.detail_address
    }
  }, (err, result) => {
    if (err) {
      res.send(404)
    } else {
      console.log(result)
      var changeCode = null
      if (result.nModified === 0) {
        res.send({account: '', code: 500, msg: 'CHANGE FAILED'})
      } else {
        if (req.cookies['account'] !== null) {
          req.cookies['account'].areaCode = req.body.areaCode
          req.cookies['account'].detail_address = req.body.detail_address
          res.send({account: req.cookies['account'], code: 200, msg: 'SUCCESS'})
        } else {
          res.send({account: '', code: 500, msg: 'Not LOGIN'})
        }
      }
    }
  })
})
// 获取轮播广告图
router.get('/getBanner', (req, res) => {
  db.banners.find({'type': 'carousel'}, (err, result) => {
    if (err) throw err
    res.send(result)
  })
})
// 获取头部广告图
router.get('/getHeadBanner', (req, res) => {
  db.banners.findOne({'type': 'headBanner', 'status': 'New'}, (err, result) => {
    if (err) throw err
    console.log(result)
    res.send(result)
  }).sort({upload_time: -1})
})
// 前台登陆处理
router.post('/dologin', (req, res) => {
  var query = {name: req.body.name, password: md5(req.body.password)}
  db.users.find(query, (err, result) => {
    if (err) {
      console.log(err)
      res.render('404')
    }
    if (result.length > 0) {
      u = result[0]
      res.cookie('account', {
        name: result[0].name,
        level: result[0].level,
        nick_name: result[0].nick_name,
        company: result[0].company
      })
      console.log(result[0].nick_name + ':登录成功' + new Date())
      db.hotLabels.find({}, null, {
        sort: {
          add_time: -1
        }
      }, (err, labels) => {
        res.render('assets/index', {
          user: result[0],
          categories: categoryies,
          hotLabels: labels,
          title: 'ECSell',
          status: 200
        })
      })
    } else {
      console.log(query.name + ':登录失败' + new Date())
      res.render('assets/login', {status: 500, user: null})
    }
  })
})
// 前台注册处理
router.post('/doregister', checkCategories)
router.post('/doregister', (req, res) => {
  console.log('用户注册' + req.body.email + new Date())
  var user = {
    name: req.body.email,
    password: md5(req.body.password),
    nick_name: req.body.email.toString().substring(0, req.body.email.indexOf('@')),
    level: '10',
    levelName: '会员',
    registerTime: new Date().getTime()
  }

  var robot = new db.users(user)
  robot.save((err) => {
    res.end('500')
  })
  res.json('200')
})
// 前台注册须知界面
router.get('/team-of-use', checkCategories)
router.get('/team-of-use', (req, res) => {
  db.systems.findOne({}, (err, system) => {
    if (err) {
      res.send(404)
    } else {
      var statusCode = null
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
      }
      res.render('assets/team-of-use', {
        system: system,
        title: 'ECSell',
        categories: categoryies,
        hotLabels: hotLabel,
        user: req.cookies['account'],
        status: statusCode
      })
    }
  })
})
// 关于我们界面
router.get('/about-us', checkCategories)
router.get('/about-us', (req, res) => {
  db.notices.findOne({}, (err, system) => {
    if (err) {
      res.send(404)
    } else {
      var statusCode = null
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
      }
      res.render('assets/about-us', {
        system: system.about_us[0],
        title: 'ECSell',
        categories: categoryies,
        hotLabels: hotLabel,
        user: req.cookies['account'],
        status: statusCode
      })
    }
  })
})
// Privacy Policy
router.get('/privacy-policy', checkCategories)
router.get('/privacy-policy', (req, res) => {
  db.notices.findOne({}, (err, system) => {
    if (err) {
      res.send(404)
    } else {
      var statusCode = null
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
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
})
// FAQ
router.get('/FAQ', (req, res) => {
  db.notices.findOne({}, (err, system) => {
    if (err) {
      res.send(404)
    } else {
      var statusCode = null
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
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
})
// attention
router.get('/attention', checkCategories)
router.get('/attention', (req, res) => {
  db.notices.findOne({}, (err, system) => {
    if (err) {
      res.send(404)
    } else {
      var statusCode = null
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
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
})
// connect_us
router.get('/contact-us', checkCategories)
router.get('/contact-us', (req, res) => {
  db.notices.findOne({}, (err, system) => {
    if (err) {
      res.send(404)
    } else {
      var statusCode = null
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
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
})

// 三级类目查找
router.get('/product/:id', checkCategories)
router.get('/product/:id', (req, res, next) => {
  db.categorys.findOne({
    'secondCategory.thirdTitles.thirdUrl': '/product/' + req.params['id']
  }, (err, result) => {
    var arr = []
    var secondParam = {}

    if (result !== null) {
      secondParam.firstTitle = result.firstCategory
      secondParam.firstUrl = result.firstUrl
      _.each(result.secondCategory, function (second) {
        var newArr = _.filter(second.thirdTitles, function (third) {
          secondParam.secondTitle = second.secondTitle
          secondParam.secondUrl = second.secondUrl
          secondParam.thirdTitle = third.thirdTitle
          secondParam.thirdUrl = third.thirdUrl
          return third.thirdUrl === '/product/' + req.params['id']
        })
        arr = _.concat(newArr, arr)
      })
      var statusCode = null
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
      }

      console.log(secondParam)
      if (arr.length === 0) {
        res.render('assets/category', {
          product: [],
          title: 'ECSell',
          prev_category: secondParam,
          categories: categoryies,
          hotLabels: hotLabel,
          user: req.cookies['account'],
          status: statusCode
        })
      } else {
        console.log(arr)
        res.render('assets/category', {
          product: arr,
          title: 'ECSell',
          prev_category: secondParam,
          categories: categoryies,
          hotLabels: hotLabel,
          user: req.cookies['account'],
          status: statusCode
        })
      }
    } else {
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
      }

      res.render('assets/404', {
        product: [],
        title: 'ECSell',
        prev_category: secondParam,
        categories: categoryies,
        hotLabels: hotLabel,
        user: req.cookies['account'],
        status: statusCode
      })
    }
  })
})

router.get('/single-product/:id', (req, res, next) => {
  console.log('-------------')
  console.log(req.cookies['account'])
  console.log('---***----')

  db.categorys.findOne({
    'secondCategory.thirdTitles.product.product_id': req.params['id']
  }, (err, result) => {
    var arr = []
    var most_like = []
    var detail_params = {}
    console.log(result)
    if (result !== null) {
      detail_params.firstTitle = result.firstCategory
      detail_params.firstUrl = result.firstUrl
      _.each(result.secondCategory, function (second) {
        _.each(second.thirdTitles, function (third) {
          var newArr = _.filter(third.product, function (four) {
            detail_params.thirdTitle = third.thirdTitle
            detail_params.thirdUrl = third.thirdUrl
            detail_params.secondTitle = second.secondTitle
            detail_params.secondUrl = second.secondUrl
            return four.product_id === req.params['id']
          })
          arr = _.concat(newArr, arr)
        })
        _.each(second.thirdTitles, function (third) {
          var mostArr = _.filter(third.product, function (four) {
            return four.product_id !== req.params['id']
          })
          most_like = _.concat(mostArr, most_like)
        })
      })
      console.log(detail_params)
      var statusCode = null
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
      }
      if (arr.length === 0) {
        res.render('assets/product-detail', {
          product: [],
          title: 'ECSell',
          like_product: most_like,
          prev_category: detail_params,
          categories: categoryies,
          hotLabels: hotLabel,
          user: req.cookies['account'],
          status: statusCode,
          errorCode: 500,
          msg: 'NOT FOUND'
        })
      } else {
        console.log(arr)
        res.render('assets/product-detail', {
          product: arr,
          like_product: most_like,
          prev_category: detail_params,
          title: 'ECSell',
          categories: categoryies,
          hotLabels: hotLabel,
          user: req.cookies['account'],
          status: statusCode
        })
      }
    } else {
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
      }
      res.render('assets/404', {
        product: [],
        title: 'ECSell',
        like_product: most_like,
        prev_category: detail_params,
        categories: categoryies,
        hotLabels: hotLabel,
        user: req.cookies['account'],
        status: statusCode,
        errorCode: 500,
        msg: 'NOT FOUND'
      })
    }
  })
})

// 产品详情页查找
router.get('/single-product/:id', checkCategories)
router.get('/single-product/:id', (req, res, next) => {
  console.log('-------------')
  console.log(req.cookies['account'])
  console.log('---***----')
  db.categorys.findOne({
    'secondCategory.thirdTitles.product.product_id': req.params['id']
  }, function (err, result) {
    var arr = []
    var detail_params = {}
    if (result !== null) {
      _.each(result.secondCategory, function (second) {
        _.each(second.thirdTitles, function (third) {
          var newArr = _.filter(third.product, function (four) {
            detail_params.thirdTitle = third.thirdTitle
            detail_params.thirdUrl = third.thirdUrl
            detail_params.secondTitle = second.secondTitle
            detail_params.secondUrl = second.secondUrl
            return four.product_id === req.params['id']
          })
          arr = _.concat(newArr, arr)
        })
      })
      console.log(detail_params)
      console.log(arr)
      var statusCode = null
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
      }

      if (arr.length === 0) {
        res.render('assets/single-product-detail', {
          product: [],
          prev_category: detail_params,
          title: 'ECSell',
          categories: categoryies,
          hotLabels: hotLabel,
          user: req.cookies['account'],
          status: statusCode,
          errorCode: 500,
          msg: 'NOT FOUND'
        })
      } else {
        console.log(arr)
        res.render('assets/single-product-detail', {
          product: arr,
          prev_category: detail_params,
          title: 'ECSell',
          categories: categoryies,
          hotLabels: hotLabel,
          user: req.cookies['account'],
          status: statusCode
        })
      }
    } else {
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
      }
      res.render('assets/404', {
        product: [],
        title: 'ECSell',
        prev_category: detail_params,
        categories: categoryies,
        hotLabels: hotLabel,
        user: req.cookies['account'],
        status: statusCode
      })
    }
  })
})

// 一级&二级类目查找
router.get('/:category/:id', checkCategories)
router.get('/:category/:id', (req, res, next) => {
  if (req.params['id'].indexOf('_') === -1 && req.params['category'] !== 'admin') {
    console.log('-------')
    // 一级类目
    db.categorys.find({
      'firstUrl': '/' + req.params['category'] + '/' + req.params['id']
    }, function (err, result) {
      console.log(result)
      if (result.length !== 0) {
        var secondCategory = result[0].secondCategory
        console.log(secondCategory)
        var statusCode = null
        var detail_params = {}
        detail_params.firstTitle = result[0].firstCategory
        detail_params.firstUrl = result[0].firstUrl

        if (req.cookies['account'] !== null) {
          statusCode = 200
        } else {
          statusCode = 500
        }
        if (secondCategory.length === 0) {
          res.render('assets/first-category', {
            product: [],
            title: 'ECSell',
            prev_category: detail_params,
            categories: categoryies,
            hotLabels: hotLabel,
            user: req.cookies['account'],
            status: statusCode,
            errorCode: 500,
            msg: 'NOT FOUND'
          })
        } else {
          res.render('assets/first-category', {
            product: secondCategory,
            title: 'ECSell',
            prev_category: detail_params,
            categories: categoryies,
            hotLabels: hotLabel,
            user: req.cookies['account'],
            status: statusCode
          })
        }
      } else {
        if (req.cookies['account'] !== null) {
          statusCode = 200
        } else {
          statusCode = 500
        }
        res.render('assets/404', {
          product: [],
          title: 'ECSell',
          prev_category: [],
          categories: categoryies,
          hotLabels: hotLabel,
          user: req.cookies['account'],
          status: statusCode
        })
      }
    })
  } else if (req.params['category'] !== 'admin') {
    // 二级类目
    console.log(req.params['category'] + '------------')
    db.categorys.findOne({
      'secondCategory.secondUrl': '/' + req.params['category'] + '/' + req.params['id']
    }, function (err, data) {
      var detail_params = {}
      detail_params.firstTitle = data.firstCategory
      detail_params.firstUrl = data.firstUrl

      var arr = []
      var newArr = _.filter(data.secondCategory, function (second) {
        detail_params.secondTitle = second.secondTitle
        detail_params.secondUrl = second.secondUrl

        return second.secondUrl === '/' + req.params['category'] + '/' + req.params['id']
      })
      console.log(req.params['category'])
      // _.concat(newArr, arr);
      console.log(newArr)
      var statusCode = null
      if (req.cookies['account'] !== null) {
        statusCode = 200
      } else {
        statusCode = 500
      }
      console.log(detail_params)
      res.render('assets/second-category', {
        product: newArr,
        title: 'ECSell',
        prev_category: detail_params,
        categories: categoryies,
        hotLabels: hotLabel,
        user: req.cookies['account'],
        status: statusCode
      })
    })
  } else {
    next()
  }
})

// SEO
router.get('/SEO_Engine', (req, res, next) => {
  db.SEOS.find({'SEO_Name': req.query.name}, (err, result) => {
    if (err) res.send(404)
    if (result.length !== 0) {
      res.send(result)
    } else {
      res.send({status: 500, msg: 'NOT FOUND'})
    }
  })
})

// MD5加密
function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex')
}

module.exports = router
