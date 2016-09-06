var fs = require('fs');
var cheerio = require('cheerio');
var randtoken = require('rand-token');
var https = require('https');
var promise = require('promise');

var Email = require(appRoot + '/models/email');
var constants = require(appRoot + '/constants');

var mailer = require('./mailer');

//TODO needs cleanup
var generateHTML = function (id, message, viewToken) {
    var finalHTML = cheerio.load(fs.readFileSync('./public/html_templates/base_template_o.html'));
    finalHTML('#ytplayer')['0'].attribs['src'] = 'https://www.youtube.com/embed/' + id + '?modestbranding=1&autoplay=1&iv_load_policy=3&rel=0&showinfo=0';
    finalHTML('#messageIn').text(message);
    var browserPage = finalHTML.html();

    var $ = cheerio.load(fs.readFileSync('./public/html_templates/base_template.html'));
    $('#videoId')['0'].attribs['src'] = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
    $('#messageIn').text(message);
    $('#finalHTMLLink')['0'].attribs['href'] = process.env.LOCAL_BACKEND + '/view/' + viewToken;

    var emailPage = $.html();
    var htmlData = {
        emailPage: emailPage,
        browserPage: browserPage
    }
    return htmlData;
}

/*
* recursive call to check the status of given video ID
* TODO: throw error if the ID is invalid
* */

var checkVideoStatus = function (id, uploadStatus) {
    var googleAPIkey = process.env.GOOGLE_API_KEY;
    var options = {
        hostname: 'www.googleapis.com',
        path: '/youtube/v3/videos?part=status&id=' + id + '&key=' + googleAPIkey,
        method: 'GET',
    }

    //TODO migrate to push notifications https://developers.google.com/youtube/v3/guides/push_notifications
    console.log('checking for', id);
    return new Promise(function (resolve, reject) { 
        https.get(options, function(response) {
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                var parsed = JSON.parse(body);
                console.log(parsed);
                if(parsed.items[0]){
                    var status = parsed.items[0].status;
                    switch(status.uploadStatus) {
                        case constants.VIDEO_PROCESSED:
                            resolve({
                                videoId: id,
                                uploadStatus: status.uploadStatus
                            });
                            return;
                        case constants.VIDEO_FAILED:
                            resolve({
                                videoId: id,
                                uploadStatus: status.uploadStatus,
                                failureReason: status.failureReason
                            });
                            return;
                        case constants.VIDEO_REJECTED:
                            resolve({
                                videoId: id,
                                uploadStatus: status.uploadStatus,
                                rejectionReason: status.rejectionReason
                            });
                            return;
                        default:
                            setTimeout(function(){
                                checkVideoStatus(id, parsed.items[0].status.uploadStatus);
                            }, 3000);
                    }
                } else {
                    console.log('invalid');
                    reject({
                        error: 'Invalid videoId'
                    });
                }
            });
        }).on('error', function(e) {
            console.error('api/email/controller:error',e);
            reject(e);
        });
    }); 
};

//TODO after checking, the request times out and then the client sends a second request? then in the second request the email is sent

var send = function (req, res) {
    var email = new Email();
    var options = req.body;
    console.log(options);
    email.videoId = options.videoId;
    email.from = options.from;
    email.to = options.to;
    email.subject = options.subject;
    email.message = options.message;
    email.viewToken = randtoken.generate(16);
    var htmlData = generateHTML(options.videoId, options.message, email.viewToken);
    email.htmlData = htmlData.browserPage;

    email.save(function (err) {
        if(err)
            res.send(err);

        checkVideoStatus(options.videoId).then(function onFulfilled(videoStatus) {
            console.log('onFulfilled');
            if(videoStatus.uploadStatus == constants.VIDEO_PROCESSED) {
                mailer.gmail(email.from, email.to, email.subject, htmlData.emailPage, function (err, response) {
                    if(err)
                        res.send(err);

                    res.send(response);
                });
            } else {
                res.send(videoStatus);
            }
        }, function reject(data) {
            console.log(data);
            res.send(data);
        } );
    });
};


exports.send = send;
exports.gmail = mailer.gmail;