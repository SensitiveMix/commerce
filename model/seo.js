var mongoose = require('mongoose')
var Schema = mongoose.Schema
var SEO = new Schema({

  SEO_Name: String,
  SEO_Url: String,
  add_time: Number

})

module.exports = SEO
