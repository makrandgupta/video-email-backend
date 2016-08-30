var express = require('express');
var router = express.Router();
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);

var gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
  'https://www.googleapis.com/auth/gmail.send', 
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/youtube.upload'
];

var url = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  scope: scopes // If you only need one scope you can pass it as string
});

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/storeAuthCode', function (req, res) {
    console.log(req.body.code);
    oauth2Client.getToken(req.body.code, function(err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if(!err) {
        oauth2Client.setCredentials(tokens);
        console.log(tokens);
        var params = {
            'userId' : 'me'
        };

        gmail.users.getProfile(params, function (err, profile) {
            if(err)
                res.send(err);

            console.log(profile);
            res.send(profile)
        });
      } else {
        console.log(err);
        res.send(err);
      }

    });
});

module.exports = router;