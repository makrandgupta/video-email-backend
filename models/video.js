var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var VideoSchema   = new Schema({
    url: String
});

module.exports = mongoose.model('Video', VideoSchema);