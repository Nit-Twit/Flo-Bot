const { model, Schema } = require('mongoose')

let gp = new Schema({
    Guild: String,
    Playing: Boolean,
    User: String,
    // Lvl: Number,
    // Exp: Number,
    // GamesWon: Number,
    AvatarUrl: String
})

module.exports = model('gameProfiles', gp)