/**
 * Created by sunNode on 16/10/16.
 */

var should = require('should')
var app = require('../app')
var request = require('supertest')
describe('router testing', function () {
  it('users have not id response', function (done) {
    request(app)
            .get('/admin')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200)
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })

  it('admin router has been response', function (done) {
    request(app)
            .get('/admin/adminlogin')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200)
            .end(function (err, res) {
              if (err) throw err
              should.exists(res.text)
              done()
            })
  })

  it('admin login test', function (done) {
    request(app)
            .post('/admin/doadminlogin')
            .send({name: 'admin', password: '123'})
            .set('Accept', 'application/json')
            .end(function (err, res) {
              if (err) throw err
              should.exists(res.text)
              done()
            })
  })

  it('admin login test', function (done) {
    request(app)
            .post('/admin/doadminlogin')
            .set('Accept', 'application/json')
            .send({name: 'admin', password: '***'})
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
              if (err) throw err
              should.exists(res.text)
              done()
            })
  })
})
