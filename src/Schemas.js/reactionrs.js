const { model, Schema } = require('mongoose')

let reationrs = new Schema({
    Guild: String,
    Message: String,
    Emoji: String,
    Role: String
})

module.exports = model('rolesSchema', reationrs)