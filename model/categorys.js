/**
 * Created by sunNode on 16/10/22.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var Schema = mongoose.Schema;
var category = new Schema({
    firstCategory: String,
    firstUrl: String,
    firstTimeStamp: Number,
    firstImages: [{
        imageUrl: String
    }],
    firstCount: Number,
    secondCategory: [{
        secondTitle: String,
        secondUrl: String,
        secondTimeStamp: Number,
        secondImages: [{
            imageUrl: String
        }],
        secondCount: Number,
        thirdTitles: [{
            thirdTitle: String,
            firstTimeStamp: Number,
            thirdImages: [{
                imageUrl: String
            }],
            thirdUrl: String,
            product: [{
                belong_category: [{
                    first: String,
                    second: String,
                    third: String
                }],
                product_id: ObjectId,
                product_title: String,
                product_spec: {
                    compact: [],
                    hardOrSoft: [],
                    type: [],
                    features: [],
                    pattern: [],
                    color: [],
                    material: []
                },
                product_price: [{
                    compile_spec: String,
                    compile_price: String
                }],
                product_danWei: {
                    danWei_key: String,
                    danWei_value: String
                },
                product_supplier: String,
                product_sell_status: String,
                product_stock_status: String,
                product_market: {
                    market_method:String,
                    market_amount:String
                },
                product_origin_price: {
                    vip_price: String,
                    regular_price: String,
                    market_price: String,
                    sale_discount_vip_price: String,
                    sale_discount_regular_price: String
                },
                product_images: [{
                    title: String,
                    url: String
                }],
                product_video_link: String,
                product_freight: {
                    product_freight_company: String,
                    product_freight_price: String
                }
            }]

        }]
    }]
});

module.exports = category;