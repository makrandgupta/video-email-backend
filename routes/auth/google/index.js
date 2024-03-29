var express = require('express');
var router = express.Router();

var controller = require('./controller');

router.post('/storeAuthCode', controller.storeAuthCode);
router.get('/getAccessToken/:email', controller.getAccessToken);

module.exports = router;