/**
 * Created by sunNode on 16/10/19.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var system = new Schema({
  name: String,
  mainContent: String,
  updateTime: Number
})

module.exports = system
