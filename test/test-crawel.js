/**
 * Created by sunNode on 16/10/16.
 */

var should = require('should')
var app = require('../app')
var request = require('supertest')
describe('upload temporyary testing', function () {
  it('uploadTemporyary should be return success', function (done) {
    request(app)
            .get('/admin/crawler')
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })
})
