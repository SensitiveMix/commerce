const express = require('express')
const router = express.Router()
const http = require('http').Server(express)
const formidable = require('formidable')
const fs = require('fs')
const crypto = require('crypto')
const db = require('../model/index')

var r = []
var u = []

// MD5加密
function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex')
}

// 客服后台登录界面
router.get('/', (req, res) => {
  res.render('services/login', {title: '客服后台', mes: ''})
})

// 客服后台登录界面
router.get('/servicesLogin', (req, res) => {
  res.render('services/login', {title: '客服后台', mes: ''})
})

// 客服后台登陆处理
let checkLogin = (req, res, next) => {
  if (u.length === 0) {
    res.render('services/404', {username: u.nick_name})
  }
  next()
}
router.post('/doServicesLogin', (req, res, next) => {
  let query = {name: req.body.name, password: md5(req.body.password), level: '0'}
  db.users.find(query, function (err, result) {
    if (err) {
      console.log(err)
    }
    if (result.length === 1) {
      console.log(result[0].nick_name + ':登录成功' + new Date())
      u = result[0]
      res.render('services/index', {username: result[0].nick_name})
    } else {
      console.log(query.name + ':登录失败' + new Date())
      res.render('services/login', {
        title: '客服后台',
        mes_info: 'login failed',
        mes: '账号密码错误'
      })
    }
  })
})

// 跳转页面-基本设置
router.get('/serviceMainSet', checkLogin)
router.get('/serviceMainSet', (req, res, next) => {
  console.log('基本设置页面' + new Date())
  res.render('services/index', {username: u.nick_name})
  console.log('基本设置成功' + u)
})

// 订单管理页面-基本设置
router.get('/orderManage', checkLogin)
router.get('/orderManage', (req, res, next) => {
  console.log('基本设置页面' + new Date())
  res.render('services/order_manage', {username: u.nick_name})
  console.log('基本设置成功' + u)
})

// 实时聊天页面-基本设置
router.get('/chatOnline', checkLogin)
router.get('/chatOnline', (req, res, next) => {
  console.log('实时聊天设置页面' + new Date())
  res.render('services/chat_manage', {username: u.nick_name})
})

module.exports = router
