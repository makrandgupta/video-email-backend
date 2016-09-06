var express = require('express');
var router = express.Router();

var controller = require('./controller');

// router.get('/teat', function (req, res) {
// 	res.send('hello');
// })
router.get('/:viewToken', controller.view);

module.exports = router;