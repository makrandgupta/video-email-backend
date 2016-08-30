var express = require('express');
var https = require('https');
var router = express.Router();
var Video = require(appRoot + '/models/video');
var sendEmail = require(appRoot + '/routes/api/sendEmail');

router.get('/all', function(req, res) {
    console.log("Getting links");
    Video.find(function(err, links) {
        if (err)
            res.send(err);
        res.json(links);
    });
});

router.post('/', function (req, res) {
    var video = new Video();
    video.url = req.body.url;
    video.subject = req.body.subject;
    video.email = req.body.email;
    video.message = req.body.message;
    video.userMail = req.body.userMail;
    video.token = req.body.token;
    console.log(video.token);


    video.save(function(err) {
        if (err)
            res.send(err);
        checkVideoStatus(video.url, video.userMail, video.email, video.subject, video.message, video.token);
        res.json({ message: 'YouTube link created!' });
    });
});

var checkVideoStatus = function (id, res, userMail, email, subject, message, token) {
    if(res && res == 'processed') {
        console.log(".");
        console.log(res);

        /*
         * TODO call the send email call based on the type of account logged in with
         * implement Google first. Outlook can be done after backend is completed
         **/
        sendEmail.sendGmail(id, userMail, email, subject, message, token);
        // sendOutlookEmail(id, userMail, email, subject, message, token);
        return res;
    }
    process.stdout.write(".");
    return https.get(
        'https://www.googleapis.com/youtube/v3/videos?part=status&id=' + id + '&key=AIzaSyA_wS4nqtaxPT5XvX3_IV6n9uot24YPNJ8',
        function(response) {
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {

                // Data reception is done, do whatever with it!
                var parsed = JSON.parse(body);
                // console.log(parsed);
                setTimeout(function(){
                    checkVideoStatus(id, parsed.items[0].status.uploadStatus, userMail, email, subject, message, token);
                }, 2000);
            });
        }
    ).on('error', function(e) {
        console.error(e);
    });
};

module.exports = router;
