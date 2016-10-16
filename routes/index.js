var express = require('express');
var router = express.Router();
var db = require('../model/index');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/getBanner', function (req, res) {
    db.banners.find({}, function (err, result) {
        if(err) throw err;
        res.send(result);
    })
});

module.exports = router;
