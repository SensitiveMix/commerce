/**
 * Created by sunNode on 16/10/16.
 */

var should = require('should')
var app = require('../app')
var request = require('supertest')
// describe('upload temporyary testing', function () {
//     it('uploadTemporyary should be return success', function (done) {
//         request(app)
//             .post('/admin/saveProductDetail')
//             .send({
//                 product: [{
//                     belong_category: [{
//                         first: 'ipad',
//                         second: 'ipad1',
//                         third: 'ipad1.1'
//                     }],
//                     product_title: '4234234',
//                     product_spec: {
//                         compact: ['12312'],
//                         hardOrSoft: ['1231'],
//                         type: ['13213'],
//                         features: ['13123'],
//                         pattern: ['3123'],
//                         color: ['31321'],
//                         material: ['13123']
//                     },
//                     product_price: [{
//                         compile_spec: '123213',
//                         compile_price: '44'
//                     }],
//                     product_danWei: {
//                         danWei_key: '444',
//                         danWei_value: '555'
//                     },
//                     product_supplier: '123213',
//                     product_sell_status: '42141',
//                     product_stock_status: '2144',
//                     product_market: {
//                         market_method: '123123',
//                         market_amount: '13121'
//                     },
//                     product_origin_price: {
//                         vip_price: '13213',
//                         regular_price: '123213',
//                         market_price: '1323',
//                         sale_discount_vip_price: '123123',
//                         sale_discount_regular_price: '1'
//                     },
//                     product_images: [{
//                         title: '1',
//                         url: '2'
//                     }],
//                     product_video_link: '3',
//                     product_freight: {
//                         product_freight_company: '3',
//                         product_freight_price: '4'
//                     }
//                 }]
//             })
//             .end(function (err, res) {
//                 if (err) throw err;
//                 should.exist(res.text);
//                 done();
//             });
//     });
// });
