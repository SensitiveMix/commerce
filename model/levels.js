var mongoose = require('mongoose')
var Schema = mongoose.Schema
var levelList = new Schema({
  level: [],
  addBy: String,
  update_time: String
})

module.exports = levelList
