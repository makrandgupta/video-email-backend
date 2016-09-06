var Email = require(appRoot + '/models/email');

var view = function(req, res) {
    Email.findOne({'viewToken':req.params.viewToken}, 'htmlData', function(err, emailData) {
        if (err)
            res.send(err);
        console.log('view email error', err);
        console.log(emailData.htmlData);
        res.send(emailData.htmlData);
    });
}

exports.view = view;
