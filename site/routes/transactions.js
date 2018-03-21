var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var Q = require('q');
var request = require('request');
var email = require('../services/email.js');
var emailMessages = require('../services/email-messages.js');
var Data = require('../user_data/data.js');

var error = {
    error: true,
    message: ''
};


router.post('/notify', function(req, res, next) {
    var recipientId = req.body.recipientId;
    var sender = req.user;
    var message = req.body.message;
    var now = Date.now();
    var newMessage = {
        date: now,
        isRequest: false,
        message: message
    }
    res.end();
});

router.get('/get-token', function(req, res, next) {
    request('https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi?supplier=ttxswaps&TranzilaPW=cZa6gd&TranzilaTK=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(response);
        }
        else{
            res.json(error);
        }
    })
});


module.exports = router;

