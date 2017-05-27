/**
 * Created by sunNode on 16/10/22.
 */
var should = require('should')
var app = require('../app')
var request = require('supertest')

describe('get single product test', function () {
  it('should get this is ios product success', function (done) {
    request(app)
            .get('/single-product/582724b31a3fb68e89a050b9')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })

  it('should get this is a phone product success', function (done) {
    request(app)
            .get('/single-product/582725da1a3fb68e89a050c7')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })

  it('should get this is a phone demo product success', function (done) {
    request(app)
            .get('/single-product/582725da1a3fb68e89a050c8')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })
})
