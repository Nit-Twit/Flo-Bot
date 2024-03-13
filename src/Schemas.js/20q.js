const { model, Schema } = require('mongoose')

let ques = new Schema({
    Guild: String,
    Max: Number,
    Category: String,
    Channel: String
})

module.exports = model('questions', ques)