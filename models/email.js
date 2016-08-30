var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EmailSchema   = new Schema({
    htmlData: String,
    token: String
});


module.exports = mongoose.model('Email', EmailSchema);