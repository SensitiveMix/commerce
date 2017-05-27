/**
 * Created by sunNode on 16/11/3.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var specManage = new Schema({
  firstCategory: String,
  secondCategory: String,
  thirdCategory: String,
  de_firstCategory: String,
  de_secondCategory: String,
  de_thirdCategory: String,
  specification: {},
  addBy: String
})

module.exports = specManage
