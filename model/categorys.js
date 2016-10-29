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
    firstCount: Number,
    secondCategory: [{
        secondTitle: String,
        secondUrl: String,
        secondCount: Number,
        thirdTitles: [{
            thirdTitle: String,
            thirdUrl: String
        }]
    }]
});

module.exports = category;