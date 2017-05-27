let mongoose = require('mongoose')
let Schema = mongoose.Schema

let feeExpress = new Schema({
  type: String,
  country: [{type: Schema.Types.ObjectId, ref: 'feeExpressCountries'}],
  discount: Number,
  fuel_cost: Number
})

module.exports = feeExpress
