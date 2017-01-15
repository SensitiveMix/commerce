let mongoose = require('mongoose')
let Schema = mongoose.Schema
let feeExpress = new Schema({
    type: String,
    country: [],
    transport_fees: [{
        transport_default_quantity: String,
        transport_add_quantity: Number,
        transport_fee: Number,
        transport_default_fee: Number,
        transport_add_fee: Number
    }],
    registered_fee: Number,
    free_ship: {
        fee_quantity: Number,
        fee_status: Boolean
    },
    expected_delivery: String
})

module.exports = feeExpress