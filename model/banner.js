/**
 * Created by sunNode on 16/10/16.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId
var Schema = mongoose.Schema
var bannerData = new Schema({
  type: String,
  image_url: String,
  upload_time: String,
  status: String
})

module.exports = bannerData
