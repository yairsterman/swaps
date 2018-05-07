var express = require('express');
var router = express.Router();
var Data = require('../user_data/data.js');
var https = require('https');

router.get('/get-data', function(req, res, next) {
    res.json(Data.getData());
});


router.get('/google-map', function(req, res, next) {
    // request('https://maps.googleapis.com/maps/api/js?key=AIzaSyBWmFeAXp3C9w8cwVHu6emXoQpmgJis9Hw&libraries=places&language=en', function (error, response, body) {
    //     response.setEncoding('utf8');
    //     if (!error && response.statusCode == 200) {
    //         decoder.write(body);
    //         res.json(decoder.write(body));
    //     }
    // })
    res.redirect('https://maps.googleapis.com/maps/api/js?key=AIzaSyAsQULXcHotWeN2NVKBQHkh_o7fCC78Wwo&libraries=places&sensor=false&language=en');

});


module.exports = router;
