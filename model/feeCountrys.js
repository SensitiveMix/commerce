var mongoose = require('mongoose')
var Schema = mongoose.Schema
var feeCountry = new Schema({
  country_name: String,
  country_value: String,
  country_status: Boolean
})

module.exports = feeCountry
