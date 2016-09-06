var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var User = require(appRoot + '/models/user');
var oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URL);

var gmail = google.gmail({ version: 'v1', auth: oauth2Client });
var plus = google.plus({ version: 'v1', auth: oauth2Client });

// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
	'https://www.googleapis.com/auth/gmail.send', 
	'https://www.googleapis.com/auth/gmail.readonly',
	'https://www.googleapis.com/auth/contacts.readonly',
	'https://www.googleapis.com/auth/youtube'
];

var url = oauth2Client.generateAuthUrl({
	access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
	scope: scopes // If you only need one scope you can pass it as string
});

exports.storeAuthCode = function (req, res) {
	oauth2Client.getToken(req.body.code, function(err, tokens) {
		// Now tokens contains an access_token and an optional refresh_token. Save them.
		if(!err) {
			oauth2Client.setCredentials(tokens);

			var params = {
			'userId' : 'me'
			};

			gmail.users.getProfile(params, function (err, email) {
				if(err)
					res.status(err.code).send(err);

				plus.people.get({ userId: 'me'}, function(err, profile) {
				  	console.log('err', err);

				  	User.findOne({'google.email':email.emailAddress}, function(err, userData) {
						if (err)
							res.send(err);

						var user = null;
						if(userData) { 
							user = userData;
						} else {
							user = new User();
							console.log('New User!');
							user.google.email = email.emailAddress;
							user.google.display_name = profile.displayName;
						}
						user.google.access_token = tokens.access_token;  
						user.google.refresh_token = tokens.refresh_token;
						user.google.expiry_date = tokens.expiry_date;
						user.save(function (err) {
							if(err)
								res.send(err);

							console.log('Tokens for ' + email.emailAddress + ' updated!');
							res.json({email: email.emailAddress});

						});
					});
				});
			});
		} else {
			console.log(err);
			res.send(err);
		}
	})
};

exports.getAccessToken = function (req, res) {
	User.findOne({'google.email':req.params.email}, 'google', function(err, userData) {
		if(err)
			if(res)
				res.send(err);
			else 
				return err;
		if(userData) { 
			oauth2Client.setCredentials(userData.google);
			oauth2Client.getAccessToken(function (err, token, response) {
				if(err)
					if(res)
						res.send(err);
					else 
						return err;

				if(res)
					res.json({access_token: token});
				else 
					return {access_token: token};
			});
		} else {
			if(res)
				res.status(404).json({error: 'Email Address not found'});
			else 
				return {error: 'Email Address not found'};
		}
	});
};