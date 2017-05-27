/**
 * Created by sunNode on 16/10/22.
 */
var should = require('should')
var app = require('../app')
var request = require('supertest')

describe('get second category test', function () {
  it('should get all wcf  thirdCategory success', function (done) {
    request(app)
            .get('/product/wcf/147896723353')
            // .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })
  it('should get all .net thirdCategory success', function (done) {
    request(app)
            .get('/product/.net/147896723328')
            // .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })

    // JSON
    //     [ { product: [],
    //     _id: 58273fc146d4fa96558176d9,
    //     thirdImages: 'logoko.png',
    //     thirdTitle: 'C#',
    //     thirdUrl: '/product/1478967233641' } ]
})
