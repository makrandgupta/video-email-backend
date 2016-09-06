// var express = require('express');
// var router = express.Router();

// router.get('/', function(req, res, next) {
//     res.render('index', { title: 'Express' });
// });

// router.post('getEmail', function (req, res) {
//     var refresh_token = req.body.token;
//     var access_name = '12';
//     getUserName(refresh_token).then(function(name){
//         access_name = name;
//         res.json({name: access_name});
//     });
// });

// var getUserName = function (token){

//     return new Promise(function (resolve, reject){
//         var emailAddress = '';
//         var form = {
//             client_id: 'bc581dd7-adb2-484f-91aa-35231a75f73b',
//             redirect_uri: 'https://localhost',
//             grant_type: 'refresh_token',
//             client_secret: 'Qzkk8hF1eeEQVe3BR3qAfuM',
//             refresh_token: token
//         };

//         var formData = querystring.stringify(form);
//         var contentLength = formData.length;

//         request({
//             headers: {
//                 'Content-Length': contentLength,
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             uri: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
//             body: formData,
//             method: 'POST'
//         }, function (err, res, body) {
//             //it works!
//             var parsed = JSON.parse(body);
//             var access_token = parsed['access_token'];

//             console.log("acc", access_token);

//             request({
//                 headers: {
//                     'Authorization': 'Bearer ' + access_token
//                 },
//                 uri: "https://outlook.office.com/api/v2.0/me/",
//                 method: 'GET'
//             }, function (err, res, body){
//                 var parsed = JSON.parse(body);
//                 emailAddress = parsed['EmailAddress'];
//                 resolve(emailAddress);
//             })

//         });
//     })
// };

// module.exports = router;