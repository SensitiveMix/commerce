var mongoose = require('mongoose')
var Schema = mongoose.Schema
var notice = new Schema({
  about_us: [{
    add_time: Number,
    main_content: String,
    addBy: String
  }],
  contact_us: [{
    add_time: Number,
    main_content: String,
    addBy: String
  }],
  FAQ: [{
    add_time: Number,
    main_content: String,
    addBy: String
  }],
  attention: [
    {
      add_time: Number,
      main_content: String,
      addBy: String
    }
  ],
  privacy_notice: [
    {
      add_time: Number,
      main_content: String,
      addBy: String
    }
  ],
  register_notice: [
    {
      add_time: Number,
      main_content: String,
      addBy: String
    }
  ]
})

module.exports = notice
