var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var User = require(appRoot + '/models/user');
var googleAuth = require(appRoot + '/routes/auth/google/controller');

var oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URL);

var gmail_api = google.gmail({ version: 'v1', auth: oauth2Client });

var gmail = function (from, to, subject, message, callback){

    if(!from){
        callback({
            error: 'FROM undefined'
        });
        return;
    }

    if(!to) {
        callback({
            error: 'TO undefined'
        });
        return;
    }

    if(!subject) {
        callback({
            error: 'SUBJECT undefined'
        });
        return;
    }


    User.findOne({'google.email':from}, 'google', function(err, userData) {
        if(err)
            console.log(err);
        if(userData) {
            console.log('sending from:', userData.google.email);
            oauth2Client.setCredentials(userData.google);
            oauth2Client.getAccessToken(function (err, token, response) {
                if(err)
                    console.log(err)

                //prepare message
                var email_lines = [];

                email_lines.push('From: "'+ userData.google.display_name +'" <'+ from +'>');
                email_lines.push('To: '+ to);
                email_lines.push('Content-type: text/html;charset=iso-8859-1');
                email_lines.push('MIME-Version: 1.0');
                email_lines.push('Subject: '+ subject);
                email_lines.push('');
                email_lines.push(message);

                var email = email_lines.join('\r\n').trim();

                var base64EncodedEmail = new Buffer(email).toString('base64');
                base64EncodedEmail = base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_');

                var params = {
                    userId: 'me',
                    resource: {
                        raw: base64EncodedEmail
                    }
                };
                gmail_api.users.messages.send(params, function (err, response) {
                    console.log('in array', (response.id && (response.labelIds.indexOf('SENT') > -1)));

                    if(response.id && (response.labelIds.indexOf('SENT') > -1)){
                        callback(null, {success: 'Mail Sent!'});
                        return;
                    } else {
                        callback({
                            error: 'Error sending Email',
                            server_response: response
                        });
                        return;
                    }
                })
            });
        } else {
            callback({
                error: 'User not authenticated'
            });        
            return;
        }
    });
    

    // var html_code = generate.html(videoID, message);
    // // login
    // var transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         xoauth2: xoauth2.createXOAuth2Generator({
    //             user: from,
    //             clientId: '333014013976-c9q2j4vekuss03ek53je0fujciokieps.apps.googleusercontent.com',
    //             clientSecret: '22VnkJwH0W7f9SIJyWUTIDAt',
    //             refreshToken: token
    //             // accessToken: 'ya29.Ci8nAx6x-0ek3jjOwRbToVJAoZmf54z_ekzgMXBc1_B6yHhM291mzoD_bNmKnQXdCw'
    //         })
    //     }
    // });
    // // setup e-mail data with unicode symbols
    // var mailOptions = {
    //     from: {
    //         name: from,
    //         address: from
    //     }, // sender address
    //     to: to, // list of receivers
    //     subject: subject, // Subject line
    //     html: html_code  // plaintext body
    //     // html: message'<b></b>' // html body
    // };

    // // send mail with defined transport object
    // transporter.sendMail(mailOptions, function(error, info){
    //     if(error){
    //         return console.log(error);
    //     }
    //     console.log('Message sent: ' + info.response);
    // });


};

var outlook = function (id, from, email, subject, message, token){
    console.log("outlookemail");
    var form = {
        client_id: 'bc581dd7-adb2-484f-91aa-35231a75f73b',
        redirect_uri: 'https://localhost',
        grant_type: 'refresh_token',
        client_secret: 'Qzkk8hF1eeEQVe3BR3qAfuM',
        refresh_token: token
    };

    var formData = querystring.stringify(form);
    var contentLength = formData.length;
    var html_code = generate.html(id, message);

    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        body: formData,
        method: 'POST'
    }, function (err, res, body) {
        //it works!
        var parsed = JSON.parse(body);
        var access_token = parsed['access_token'];

        var emailFormData =
        {
            "Message": {
                "Subject": subject,
                "Body": {
                    "ContentType": "HTML",
                    "Content": html_code
                },
                "ToRecipients": [
                    {
                        "EmailAddress": {
                            "Address": email
                        }
                    }
                ]
            },
            "SaveToSentItems": "true"
        }

        request({
            headers: {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            },
            uri: "https://outlook.office.com/api/v2.0/me/sendmail",
            json: emailFormData,
            method: 'POST'
        }, function (err, res, body){
            if (err == undefined || err == '' || err == null){
                console.log("Email sent!");
            }
        });

    });
};

exports.gmail = gmail;
exports.outlook = outlook;