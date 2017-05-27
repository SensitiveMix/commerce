/**
 * Created by sunNode on 16/10/19.
 */
var should = require('should')
var app = require('../app')
var request = require('supertest')

describe('user login test', function () {
  it('vaild user should login success', function (done) {
    request(app)
            .post('/dologin')
            .send({name: 'test@123.com', password: '123'})
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })
  it('invaild password should login failed', function (done) {
    request(app)
            .post('/dologin')
            .send({name: 'test@123.com', password: '1234'})
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })
  it('invaild login name should login failed', function (done) {
    request(app)
            .post('/dologin')
            .send({email: 'test@123.com', password: '1234'})
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })
})
