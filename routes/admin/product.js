const express = require('express')
const router = express.Router()
const db = require('../../model/index')

router.get('/product', (req, res) => {
    let payload = _processPayload(req.query)
    db.products.find(payload, (err, product) => {
        console.log(err)
        if (err) return _processError(res)
        res.send({succeed: true, msg: product})
    }).sort({'update_time': -1})
})
//修改产品
router.put('/product', (req, res) => {
    db.products.findOneAndUpdate({_id: req.body.id}, {$set: req.body.content}, (err, product) => {
        if (err) return _processError(res)
        if (product.length == 0) return _processRes(res)
        res.send({succeed: true, msg: '修改成功'})
    })
})
//产品上架
router.delete('/product', (req, res) => {
    db.products.findOneAndUpdate({_id: req.body.id, status: 'pending'}, {$set: {status: 'online'}}, (err, product) => {
        if (err) return _processError(res)
        if (!product)return _processRes(res)
        res.send({succeed: true, msg: '上架成功'})
    })
})
//产品下架
router.delete('/product', (req, res) => {
    db.products.findOneAndUpdate({_id: req.body.id, status: 'online'}, {$set: {status: 'outline'}}, (err, product) => {
        if (err) return _processError(res)
        if (!product)return _processRes(res)
        res.send({succeed: true, msg: '下架成功'})
    })
})


//工具方法
function _processError(res) {
    return res.send(500, {succeed: false, msg: '数据库错误'})
}

function _processRes(res) {
    return res.send(400, {succeed: false, msg: '产品不存在'})
}

function _processPayload(obj) {
    if (_parseObj(obj, 'time_type')) {
        let time = obj['time_type']
        _clearObj(obj, 'time_type')
        let payload = {}
        _appendObj(obj, 'start', payload)
        _appendObj(obj, 'end', payload)
        obj[time] = payload
    }
    return obj
}

function _parseObj(argument, key) {
    return argument.hasOwnProperty(key)
}

function _clearObj(argument, key) {
    if (typeof key === 'string') {
        delete argument[key]
    } else {
        for (let i in key) {
            delete argument[i]
        }
    }
}

function _appendObj(argument, key, payload) {
    if (_parseObj(argument, key)) {
        let symbol = key == 'start' ? '$gte' : '$lt'
        payload[symbol] = argument[key]
        delete argument[key]
    }
}


module.exports = router