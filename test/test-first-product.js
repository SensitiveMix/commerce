/**
 * Created by sunNode on 16/10/22.
 */
var should = require('should')
var app = require('../app')
var request = require('supertest')

describe('get first category test', function () {
  it('should get all secondCategory success', function (done) {
    request(app)
            .get('/products/soap/147896723310')
            // .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
              if (err) throw err
              should.exist(res.text)
              done()
            })
  })
    // JSON
    // [ { secondImages: [],
    //     thirdTitles: [ [Object] ],
    //     _id: 58273fc146d4fa96558176d8,
    //     secondCount: 0,
    //     secondUrl: '/product/wcf/147896723353',
    //     secondTimeStamp: 1478970000,
    //     secondTitle: 'wcf' },
    //     { secondImages: [],
    //         thirdTitles: [ [Object] ],
    //         _id: 58273fc146d4fa96558176d6,
    //         secondCount: 0,
    //         secondUrl: '/product/.net/147896723328',
    //         secondTimeStamp: 1478970000,
    //         secondTitle: '.net' } ]
})
