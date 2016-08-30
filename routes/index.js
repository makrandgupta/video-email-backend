var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('view', function(req, res) {
  EmailData.findOne({'token':req.params.token}, 'htmlData', function(err, emailData) {
    if (err)
      res.send(err);
    res.send(emailData.htmlData);
  });
});

module.exports = router;
