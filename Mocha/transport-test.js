/**
 * Created by sunNode on 16/10/20.
 */
var should = require('should');
var app = require('../app');
var request = require('supertest');

describe('product transport conditions test', function () {
    it('product should return express price', function (done) {
        request(app)
            .post('/admin/transport')
            .send({weight: '2', area: '1', type: 'express'})
            .end(function (err, res) {
                should.exist(res.text);
                console.log(res.text)
                done();
            });
    });
});