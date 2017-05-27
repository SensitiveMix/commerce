/**
 * Created by sunNode on 16/10/19.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var uploadHistory = new Schema({
  firstCategory: String,
  secondCategory: String,
  thirdCategory: String,
  upload_time: Date
})

module.exports = uploadHistory
