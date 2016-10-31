/**
 * Created by sunNode on 16/10/16.
 */


var should = require('should');
var app = require('../app');
var request = require('supertest');
describe('upload temporyary testing', function () {
    it('uploadTemporyary should be return success', function (done) {
        request(app)
            .post('/admin/uploadTemporary')
            .send({
                firstCategory: '123',
                secondCategory: '456',
                thirdCategory: '567'
            })
            .end(function (err, res) {
                if (err) throw err;
                console.log(res.text)
                should.exist(res.text);
                done();
            });
    });

    it('uploadTemporyary should be return failed', function (done) {
        request(app)
            .post('/admin/uploadTemporary')
            .send({
                firstCategory: '',
                secondCategory: '456',
                thirdCategory: '567'
            })
            .end(function (err, res) {
                if (err) throw err;
                console.log(res.text)
                should.exist(res.text);
                done();
            });
    });


});
