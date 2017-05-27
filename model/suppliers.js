/**
 * Created by sunNode on 16/10/13.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId
var Schema = mongoose.Schema
var supplierData = new Schema({
  name: String,
  supplier_id: Number,
  add_location: String,
  add_time: String,
  add_time_number: Number
})

module.exports = supplierData
