const express = require('express')
const router = express.Router()

router.get('/product', (req, res) => {
    let payload = req.query
    payload.online = true
    db.products.find(payload, (err, product) => {
        if (err) return _processError(res)
        res.send({succeed: true, msg: product})
    })
})

router.put('/product', (req, res) => {
    db.products.findOneAndUpdate({_id: req.body.id}, {$set: req.body.content}, (err, product) => {
        if (err) return _processError(res)
        if (product.length == 0) return _processRes(res)
        res.send({succeed: true, msg: '修改成功'})
    })
})

router.delete('/product', (req, res) => {
    db.products.findOneAndUpdate({_id: req.query.id}, {$set: {online: false}}, (err, product) => {
        if (err) return _processError(res)
        console.log(product)
        if (!product)return _processRes(res)
        res.send({succeed: true, msg: '下架成功'})
    })
})


function _processError(res) {
    return res.send(500, {succeed: false, msg: '数据库错误'})
}

function _processRes(res) {
    return res.send(400, {succeed: false, msg: '产品不存在'})
}


module.exports = router