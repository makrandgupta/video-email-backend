var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    google: {
    	display_name: String,
        access_token: String,
        refresh_token: String,
        expiry_date: String,
        email: String,
    }

});

module.exports = mongoose.model('User', userSchema);