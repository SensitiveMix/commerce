let mongoose = require('mongoose')
let Schema = mongoose.Schema
let list = new Schema({
  type: String,
  countryLists: [{
    country_en_name: String,
    country_cn_name: String,
    country_status: Boolean,
    country_area: String,
    country_code: String
  }]
})

module.exports = list
