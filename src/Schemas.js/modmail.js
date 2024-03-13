const { model, Schema } = require('mongoose')

let modmail = new Schema({
    Guild: String,
    User: String
})

module.exports = model('modmailSchema', modmail)