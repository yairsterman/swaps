let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let User = require('../models/User.js');
let Q = require('q');
let request = require('request');
let Request = require('../models/Request.js');
let email = require('../services/email.js');
let transactionsService = require('../services/transactionsService.js');
let creditService = require('../services/creditService.js');
let requestsService = require('../services/requestsService.js');
let Data = require('../user_data/data.js');

let error = {
    error: true,
    message: ''
};

router.post('/notify', function(req, res, next) {
    let recipientId = req.body.recipientId;
    let sender = req.user;
    let message = req.body.message;
    let now = Date.now();
    let newMessage = {
        date: now,
        isRequest: false,
        message: message
    }
    res.end();
});

router.post('/success', function(req, res, next) {

    if(parseInt(req.body.requestType) == Data.getRequestType().creditPurchase){
        let params = req.body;
        params.type = Data.getTransactionType().regular;
        transactionsService.createAndSaveToUser(params, req.body.user1) // save transaction in db and save id to user.transactions
            .then(function ({transactionId, token}){
                let amount = Math.round(parseFloat(req.body.sum) / Data.getCreditInfo().price); // get the exact amount of credits purchased
                // let amount = 12; // TODO: for testing, REMOVE!!
                return creditService.purchaseCredits(req.body.user1, amount);
            })
            .then(function (){
                res.redirect('/success');
            },function (err){
                console.log(err);
                res.redirect('/fail?'+err);
            });
    }
    else{
        let requestDetails = {
            dates: req.body.dates,
            guests: req.body.guests,
            message: req.body.message,
            plan: req.body.plan,
            deposit: true,
            requestId: req.body.requestId
        };

        let params = req.body;
        let expdate = params.expmonth + params.expyear; // save expiration date in case of confirmation
        params.type = Data.getTransactionType().verify;
        Request.findOne({_id: req.body.requestId})
        // populate both users to get their information
            .populate({
                path: 'user1',
                select: '_id email firstName city credit apptInfo'
            })
            .populate({
                path: 'user2',
                select: '_id email firstName city credit apptInfo'
            })
            .exec(function (err, request) {
                if (err || !request) {
                    let msg = err;
                    return res.redirect('/fail?'+err);
                }
                let actionUser = {};
                if(parseInt(req.body.requestType) == Data.getRequestType().accept){
                    actionUser = request.user2._id;
                }
                else{
                    actionUser = request.user1._id;
                }
                transactionsService.createAndSaveToUser(params, actionUser) // save transaction in db and save id to user.transactions
                    .then(function ({transactionId, token}){
                        requestDetails.transactionId = transactionId;
                        //see whether this is a request acceptance or a confirmation
                        if(parseInt(req.body.requestType) == Data.getRequestType().accept){
                            return requestsService.accept(requestDetails, request);
                        }
                        else{
                            requestDetails.token = token;
                            requestDetails.expdate = expdate;
                            return requestsService.confirm(requestDetails, request);
                        }
                    })
                    .then(function (){
                        res.redirect('/success');
                    },function (err){
                        console.log(err);
                        res.redirect('/fail?'+err);
                    });
            });
    }
});

router.post('/fail', function(req, res, next) {
    res.redirect('/fail?fail');
});


module.exports = router;

