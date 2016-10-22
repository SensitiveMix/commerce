/**
 * Created by sunNode on 16/10/22.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var Schema = mongoose.Schema;
var category = new Schema({
    firstCategory: String,
    secondCategory: [{
        secondTitle:String,
        thirdTitle:[]
    }]
});

module.exports = category;