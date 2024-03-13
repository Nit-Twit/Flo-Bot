const { model, Schema } = require('mongoose')

let mmSetup = new Schema({
    Guild: String,
    Category: String,
    Enabled: Boolean
})

module.exports = model('mmSetup', mmSetup)