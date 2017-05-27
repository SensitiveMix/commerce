/**
 * Created by sunNode on 16/10/20.
 */
var should = require('should')
var app = require('../app')
var request = require('supertest')

describe('product transport conditions test', function () {
  it('product should return express/ordinary/little transport price', function (done) {
    request(app)
            .post('/admin/transport')
            .send({weight: '0.5', area: '澳门'})
            .end(function (err, res) {
              should.exist(res.text)
              console.log(res.text)
              done()
            })
  })

  it('product should return express/ordinary transport price', function (done) {
    request(app)
            .post('/admin/transport')
            .send({weight: '2.5', area: '澳门'})
            .end(function (err, res) {
              should.exist(res.text)
              console.log(res.text)
              done()
            })
  })

  it('product should return little transport price', function (done) {
    request(app)
            .post('/admin/transport')
            .send({weight: '22', area: '澳门'})
            .end(function (err, res) {
              should.exist(res.text)
              console.log(res.text)
              done()
            })
  })
})
