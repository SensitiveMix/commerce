/**
 * Created by sunNode on 16/10/16.
 */

var should = require('should')
var app = require('../app')
var chai = require('chai')
var expect = chai.expect
var assert = require('assert')
var request = require('supertest')
describe('getGoodsDetail temporyary testing', function () {
  it('uploadTemporyary should be return success', function (done) {
    request(app)
            .post('/admin/uploadProductDetail')
            .send([{
              firstCategory: 'test111',
              secondCategory: 'test2222',
              thirdCategory: 'test33333'
            }, {
              firstCategory: 'test222',
              secondCategory: 'test2222',
              thirdCategory: 'test33333'
            }])
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })
})
