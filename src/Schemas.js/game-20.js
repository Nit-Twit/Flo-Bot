const { model, Schema } = require('mongoose')

let twenty = new Schema({
    Guild: String,
    GameId: String,
    Topic: String,
    Hint: String,
    User: String,
    RoleId: String,
    Channel: String,
    Msg: String,
    Joined: Number,
    Active: Boolean,
    QuestionNum: Number,
    Users: Array,
    ChannelOrigin: String
})

module.exports = model('twentyQuestions', twenty)