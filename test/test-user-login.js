/**
 * Created by sunNode on 16/10/22.
 */
var should = require('should')
var app = require('../app')
var request = require('supertest')

describe('user register test', function () {
  it('vaild name password should login failed', function (done) {
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
})
