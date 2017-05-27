/**
 * Created by sunNode on 16/10/16.
 */

var should = require('should')
var app = require('../app')
var request = require('supertest')
describe('upload temporyary testing', function () {
  it('uploadTemporyary should be return success', function (done) {
    request(app)
            .post('/admin/uploadTemporary')
            .send({
              firstCategory: 'test111',
              secondCategory: 'test2222',
              thirdCategory: 'test33333'
            })
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })

  it('uploadTemporyary should be return failed', function (done) {
    request(app)
            .post('/admin/uploadTemporary')
            .send({
              firstCategory: '111',
              secondCategory: '456',
              thirdCategory: '567'
            })
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })
})
