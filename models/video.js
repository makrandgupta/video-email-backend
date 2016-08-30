var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var VideoSchema   = new Schema({
    url: String,
    email: String,
    subject: String,
    message: String,
    userMail: String,
    token: String
});

module.exports = mongoose.model('Video', VideoSchema);