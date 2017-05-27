/**
 * Created by sunNode on 16/10/20.
 */
var should = require('should')
var app = require('../app')
var request = require('supertest')

describe('user register conditions test', function () {
  it('users should  change conditions success', function (done) {
    request(app)
            .post('/admin/doChangeConditions')
            .send({mainContent: 'test123', status: 'test'})
            .end(function (err, res) {
              should.exist(res.text)
              done()
            })
  })
})
