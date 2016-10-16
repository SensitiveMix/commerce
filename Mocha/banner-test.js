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
            .expect('[{"_id":"58035d064b717807cc8af4ca","image_url":"/upload/0.5062473323196173.png","upload_time":"1476615430903","status":"New","__v":0}]')
            .end(function (err, res) {
                if (err) throw err;
                console.log(res.text);
                should.exist(res.text);
                done();
            });
    });
});