var express = require('express');
var router = express.Router();
var Data = require('../user_data/data.js');
var https = require('https');

router.get('/get-amenities', function(req, res, next) {
    res.json(Data.getAmenities());
});

router.get('/get-property-type', function(req, res, next) {
    res.json(Data.getPropertyType());
});

router.get('/get-things-to-do', function(req, res, next) {
    res.json(Data.getThingsToDo());
});

router.get('/get-genders', function(req, res, next) {
    res.json(Data.getGenders());
});

router.get('/get-deposits', function(req, res, next) {
    res.json(Data.getSecurityDeposit());
});

router.get('/google-map', function(req, res, next) {
    // request('https://maps.googleapis.com/maps/api/js?key=AIzaSyBWmFeAXp3C9w8cwVHu6emXoQpmgJis9Hw&libraries=places&language=en', function (error, response, body) {
    //     response.setEncoding('utf8');
    //     if (!error && response.statusCode == 200) {
    //         decoder.write(body);
    //         res.json(decoder.write(body));
    //     }
    // })
    res.redirect('https://maps.googleapis.com/maps/api/js?key=AIzaSyBWmFeAXp3C9w8cwVHu6emXoQpmgJis9Hw&libraries=places&language=en');

});


module.exports = router;
