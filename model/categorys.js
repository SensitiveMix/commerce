const mongoose = require('mongoose')
const Schema = mongoose.Schema
const category = new Schema({
  firstCategory: String,
  firstUrl: String,
  de_firstUrl: String,
  de_firstCategory: String,
  firstTimeStamp: Number,
  firstImages: [{
    imageUrl: String
  }],
  firstCount: Number,
  secondCategory: [{
    secondTitle: String,
    de_secondTitle: String,
    secondUrl: String,
    de_secondUrl: String,
    secondTimeStamp: Number,
    secondImages: String,
    secondCount: Number,
    thirdTitles: [{
      thirdTitle: String,
      firstTimeStamp: Number,
      product: [{type: Schema.Types.ObjectId, ref: 'products'}],
      thirdImages: String,
      thirdUrl: String,
      de_thirdTitle: String,
      de_thirdUrl: String
    }]
  }]
})

module.exports = category
