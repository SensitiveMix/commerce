/**
 * Created by sunNode on 16/11/3.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var specManage = new Schema({
    compatibility: [],
    type: [],
    hardOrSoft: [],
    features: [],
    pattern: [],
    Color:[],
    material:[],
    addBy:String
});

module.exports = specManage;