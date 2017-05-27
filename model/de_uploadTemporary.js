/**
 * Created by sunNode on 16/10/19.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var uploadTemporary = new Schema({
  firstCategory: String,
  secondCategory: String,
  thirdCategory: String,
  upload_time: Number,
  addBy: String,
  status: String
})

module.exports = uploadTemporary
