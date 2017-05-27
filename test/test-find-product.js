/**
 * Created by sunNode on 16/10/22.
 */
var should = require('should')
var app = require('../app')
var request = require('supertest')

describe('user register test', function () {
  it('should get product success', function (done) {
    request(app)
            .get('/product/147896030718')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })
})
