var express = require('express');
var router = express.Router();
var controller = require('./controller');

router.post('/send', controller.send);
router.get('/', function (req, res) {
	res.send('testing!');
})

module.exports = router;
