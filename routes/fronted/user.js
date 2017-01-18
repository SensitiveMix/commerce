const express = require('express')
const async = require('async')
const router = express.Router()

router.get('/user/:language', (req, res) => {
    async.parallel([
            function (done) {
                db.categorys.find({}, function (err, result) {
                    if (err) res.send('404')
                    categoryies = result
                    done(err, result)
                })
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
                let category = results[0]
                let labels = results[1]
                let account = null
                let statusCode = 500
                if (req.cookies["account"] != null) {
                    account = req.cookies['account'];
                    statusCode = 200;
                }
                console.log(category)
                res.render('assets/index', {
                    title: 'ECSell',
                    url: '/',
                    categories: category,
                    hotLabels: labels,
                    user: account,
                    status: statusCode
                })
            }
        })
})


module.exports = router