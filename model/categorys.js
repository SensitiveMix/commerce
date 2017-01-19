const mongoose = require('mongoose')
const Schema = mongoose.Schema
const category = new Schema({
    firstCategory: String,
    de_firstCategory: String,
    firstUrl: String,
    firstTimeStamp: Number,
    firstImages: [{
        imageUrl: String
    }],
    firstCount: Number,
    secondCategory: [{
        secondTitle: String,
        de_secondTitle: String,
        secondUrl: String,
        secondTimeStamp: Number,
        secondImages: String,
        secondCount: Number,
        thirdTitles: [{
            thirdTitle: String,
            de_thirdTitle: String,
            firstTimeStamp: Number,
            product: [{type: Schema.Types.ObjectId, ref: 'products'}],
            thirdImages: String,
            thirdUrl: String
        }]
    }]
})

module.exports = category