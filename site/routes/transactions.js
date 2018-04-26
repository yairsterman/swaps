var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var Q = require('q');
var request = require('request');
var email = require('../services/email.js');
var transactionsService = require('../services/transactionsService.js');
var requestsService = require('../services/requestsService.js');
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

router.post('/success', function(req, res, next) {
    let token = req.body.TranzilaTK;
    let cred_type = req.body.cred_type;
    let expmonth = req.body.expmonth;
    let expyear = req.body.expyear;
    let currency = req.body.currency;
    let sum = req.body.amount; // this is the direct payment sum
    let deposit = req.body.sum; // this is the deposit sum

    let requestDetails = {};
    if(req.body.requestType == Data.getRequestType().request){
        requestDetails = {
            user1: req.body.user1,
            user2: req.body.user2,
            dates: req.body.dates,
            guests: req.body.guests,
            message: req.body.message
        };
    }

    let params = {
        token: token,
        cred_type: cred_type,
        expdate: expmonth+expyear,
        currency: currency,
        sum: sum,
        deposit: deposit,
    };

    transactionsService.completeTransaction(params, requestDetails.user1) // save transaction in db and save id to user.transactions
    .then(function (transactionId){
        requestDetails.transactionId = transactionId;
        return requestsService.sendRequest(requestDetails);
    })
    .then(function (){
        res.redirect('/success');
    },function (err){
        console.log(err);
        res.redirect('/fail');
    });
});

router.post('/fail', function(req, res, next) {
    res.redirect('/fail');
});


module.exports = router;

