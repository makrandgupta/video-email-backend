var express = require('express');
var router = express.Router();
var Email = require(appRoot + '/models/email');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/view/:token', function(req, res) {
    console.log(req.params.token);
    Email.findOne({'token':req.params.token}, 'htmlData', function(err, emailData) {
        if (err)
            res.send(err);
        res.send(emailData.htmlData);
    });
});

router.get('/all', function(req, res) {
    console.log("Getting Emails");
    Email.find(function(err, emails) {
        if (err)
            res.send(err);
        res.json(emails);
    });
});

module.exports = router;
