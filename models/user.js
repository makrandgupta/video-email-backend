var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our user model
var userSchema = new Schema({
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }

});


// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);