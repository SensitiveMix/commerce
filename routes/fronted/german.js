const express = require('express')
const router = express.Router()
const async = require('async')
const db = require('../../model/index')

var hotLabel = []
var categoryies = []
var u = []

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
            },
            done => {
                db.banners.find({'type': 'carousel'}, (err, banners) => {
                    if (err) return customError(500, '数据库查询错误', res)
                    done(err, banners)
                })
            }
        ],
        (err, response) => {
            if (err) return customError(500, '数据库查询错误', res)
            let category = response[0]
            let labels = response[1]
            let banners = response[2]
            let account = null
            let statusCode = 500
            if (req.cookies["account"] != null) {
                account = req.cookies['account']
                statusCode = 200
            }
            res.render('assets/index/de', {
                title: 'ECSell',
                url: '/',
                categories: category,
                hotLabels: labels,
                banners: banners,
                user: account,
                status: statusCode,
                language: 'German'
            })
        })
})

router.get('/getBanner', (req, res) => {
    console.log('1111')
    db.banners.find({'type': 'carousel'}, (err, banners) => {
        if (err) return customError(500, '数据库查询错误', res)
        res.send(banners)
    })
})


module.exports = router