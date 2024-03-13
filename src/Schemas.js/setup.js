const { model, Schema } = require('mongoose')

let setup = new Schema({
    Guild: String,
    Role: Array
})

module.exports = model('set', setup)