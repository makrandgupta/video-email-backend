var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');
var getHTML = require(appRoot + '/routes/api/generateEmail');

module.exports = {
    sendGmail: function (id, userMail, email, subject, message, token){
        // listen for token updates (if refreshToken is set)
        // you probably want to store these to a db

        var html_code = getHTML.getHTML(id, message);
        // login
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                xoauth2: xoauth2.createXOAuth2Generator({
                    user: userMail,
                    clientId: '333014013976-c9q2j4vekuss03ek53je0fujciokieps.apps.googleusercontent.com',
                    clientSecret: '22VnkJwH0W7f9SIJyWUTIDAt',
                    refreshToken: token
                    // accessToken: 'ya29.Ci8nAx6x-0ek3jjOwRbToVJAoZmf54z_ekzgMXBc1_B6yHhM291mzoD_bNmKnQXdCw'
                })
            }
        });
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: {
                name: userMail,
                address: userMail
            }, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: html_code  // plaintext body
            // html: message'<b></b>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });


    },

    sendOutlook: function (id, userMail, email, subject, message, token){
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
        var html_code = getHTML(id, message);

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
    }
};