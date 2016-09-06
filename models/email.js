var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EmailSchema   = new Schema({
	to: String,
    subject: String,
    message: String,
    from: String,
    viewToken: String,
    htmlData: String,
});


module.exports = mongoose.model('Email', EmailSchema);