/**
 * Created by sunNode on 16/10/19.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var fee = new Schema({
  country_name: String,
  country_fee: String,
  update_time_sort: Number,
  update_time: String
})

module.exports = fee
