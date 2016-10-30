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
            thirdUrl: String
        }]
    }]
});

module.exports = category;