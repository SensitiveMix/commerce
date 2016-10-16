/**
 * Created by sunNode on 16/10/16.
 */

var expect = require('chai').expect;
var add = require('./add');


describe('加法函数的测试', function () {
    it('1 加 1 应该等于 2', function () {
        expect(add(1, 1)).to.be.equal(2);
    });
});