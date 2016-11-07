/**
 * Created by sunNode on 16/11/3.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var specManage = new Schema({
    compatibility: [{
        name: String,
        belong: String
    }],
    type: [{
        name: String,
        belong: String
    }],
    hardOrSoft: [{
        name: String,
        belong: String
    }],
    features: [{
        name: String,
        belong: String
    }],
    pattern: [{
        name: String,
        belong: String
    }],
    Color: [{
        name: String,
        belong: String
    }],
    material: [{
        name: String,
        belong: String
    }],
    addBy: String
});

module.exports = specManage;