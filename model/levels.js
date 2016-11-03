/**
 * Created by sunNode on 16/11/2.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var levelList = new Schema({
    level: [],
    addBy: String,
    update_time: String
});

module.exports = levelList;