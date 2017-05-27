/**
 * Created by sunNode on 16/11/3.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var specManage = new Schema({
  firstCategory: String,
  secondCategory: String,
  thirdCategory: String,
  specification: {},
  addBy: String
})

module.exports = specManage
