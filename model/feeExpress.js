let mongoose = require('mongoose')
let Schema = mongoose.Schema

let feeExpress = new Schema({
    type: String,
    country: [],
    discount: Number,
    fuel_cost: Number
})

module.exports = feeExpress