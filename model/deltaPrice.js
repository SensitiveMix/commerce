/**
 * Created by sunNode on 16/10/19.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var deltaPrice = new Schema({
  delta_price: Number,
  update_time: Number
})

module.exports = deltaPrice
