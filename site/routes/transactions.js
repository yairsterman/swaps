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
    let currency = req.body.currency;
    let sum = req.body.amount; // this is the payment sum

    let requestDetails = {
        user1: req.body.user1,
        user2: req.body.user2,
        dates: req.body.dates,
        guests: req.body.guests,
        message: req.body.message,
        plan: req.body.plan,
        requestId: req.body.requestId
    };

    let params = {
        token: token,
        cred_type: cred_type,
        currency: currency,
        sum: sum,
        type: Data.getTransactionType().verify
    };

    transactionsService.createAndSaveToUser(params, requestDetails.user1) // save transaction in db and save id to user.transactions
    .then(function ({transactionId, token}){
        requestDetails.transactionId = transactionId;
        //see whether this is a first request or a confirmation
        if(req.body.requestType == Data.getRequestType().request){
            return requestsService.sendRequest(requestDetails);
        }
        else {
            requestDetails.token = token;
            return requestsService.confirm(requestDetails);
        }
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

