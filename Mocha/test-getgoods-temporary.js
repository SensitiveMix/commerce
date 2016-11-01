/**
 * Created by sunNode on 16/10/16.
 */


var should = require('should');
var app = require('../app');
var chai = require('chai');
var expect = chai.expect;
var assert = require('assert');
var request = require('supertest');
describe('getGoodsDetail temporyary testing', function () {
    it('uploadTemporyary should be return success', function (done) {
        request(app)
            .post('/admin/getGoodsDetail')
            .send({
                firstCategory: 'test111',
                secondCategory: 'test2222',
                thirdCategory: 'test33333'
            })
            .end(function (err, res) {
                if (err) throw err;
                assert.equal("200", JSON.parse(res.text).code);
                // should.exist(res.text);
                done();
            });
    });

    it('getGoodsDetail should be return failed', function (done) {
        request(app)
            .post('/admin/getGoodsDetail')
            .send({
                firstCategory: '',
                secondCategory: '456',
                thirdCategory: '567'
            })
            .end(function (err, res) {
                if (err) throw err;
                expect(JSON.parse(res.text).code).equal("400");
                done();
            });
    });


});
