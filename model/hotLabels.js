/**
 * Created by sunNode on 16/10/22.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId
var Schema = mongoose.Schema
var label = new Schema({
  label_name: String,
  color_name: String,
  add_time: Number,
  belong_category: String
})

module.exports = label
