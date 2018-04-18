var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
// var transactions = require('../models/transaction.js');
var Q = require('q');
var request = require('request');
var email = require('../services/email.js');
var emailMessages = require('../services/email-messages.js');
var Data = require('../user_data/data.js');

var error = {
    error: true,
    message: ''
};

const tranzillaSupplier = 'ttxswaps';
const TranzilaPW = 'cZa6gd';
const tranmode = 'A';

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

router.post('/success', function(req, res, next) {
    let token = req.body.TranzilaTK;
    let cred_type = req.body.cred_type;
    let expmonth = req.body.expmonth;
    let expyear = req.body.expyear;
    let currency = req.body.currency;
    let sum = 5;

    let params = {
        token: token,
        cred_type: cred_type,
        expdate: expmonth+expyear,
        currency: currency,
        sum: sum,
    };
    

    completeTransaction(params).then(function (){
        res.redirect('/success');
    });
});

router.post('/fail', function(req, res, next) {
    res.redirect('/fail');
});

router.get('/get-token', function(req, res, next) {
    request('https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi?supplier='+tranzillaSupplier+'&TranzilaPW='+TranzilaPW+'&TranzilaTK=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(response);
        }
        else{
            res.json(error);
        }
    })
});

function completeTransaction(params){

    let dfr = Q.defer();
    let requestUrl = `https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi?supplier=${tranzillaSupplier}&TranzilaPW=${TranzilaPW}&TranzilaTK=${params.token}&tranmode=${tranmode}&expdate=${params.expdate}&sum=${params.sum}currency=${params.currency}&cred_type=${params.cred_type}`;

    request(requestUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            dfr.resolve(response);
        }
        else{
            dfr.reject(error);
        }
    })

    return dfr.promise;
}


module.exports = router;

