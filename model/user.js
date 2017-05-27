/**
 * Created by sunNode on 16/10/13.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId
var Schema = mongoose.Schema
var userData = new Schema({
  name: String,
  password: String,
  sex: String,
  mobile: String,
  nick_name: String,
  email_address: String,
  level: String,
  levelName: String,
  userType: String,
  company: String,
  registerTime: Number,
  areaCode: {type: String, default: ''},
  detailAddress: {type: String, default: ''}
})

module.exports = userData
