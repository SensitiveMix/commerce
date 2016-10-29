/**
 * Created by sunNode on 16/10/16.
 */
var should = require('should');
var app = require('../app');
var request = require('supertest');
describe('router testing', function () {
    it('users get banner images', function (done) {
        request(app)
            .get('/getBanner')
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) throw err;
                console.log(res);
                res.text.should.not.be.empty;

                done();
            });
    });
});