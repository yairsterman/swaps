var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var Transaction = require('../models/transaction.js');
var Q = require('q');
var request = require('request');
var email = require('../services/email.js');
var emailMessages = require('../services/email-messages.js');
var Data = require('../user_data/data.js');

var error = {
    error: true,
    message: ''
};

const tranzillaSupplier = 'ttxswapstok';
const TranzilaPW = 't97lyt';
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
    let sum = req.body.amount; // this is the direct payment sum
    let deposit = req.body.sum; // this is the deposit sum

    let params = {
        token: token,
        cred_type: cred_type,
        expdate: expmonth+expyear,
        currency: currency,
        sum: sum,
        deposit: deposit,
    };
    

    completeTransaction(params).then(function (){
        res.redirect('/success');
    },function (err){
        console.log(err);
        res.redirect('/fail');
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
    let requestUrl = `https://secure5.tranzila.com/cgi-bin/tranzila71pme.cgi`;

    request.post({
            headers : {"Content-Type": "application/x-www-form-urlencoded"},
            url: requestUrl,
            body: `supplier=${tranzillaSupplier}&TranzilaPW=${TranzilaPW}&TranzilaTK=${params.token}&tranmode=${tranmode}&expdate=${params.expdate}&sum=${params.sum}&currency=${params.currency}&cred_type=${params.cred_type}&response_return_format=json`
        }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let result;
            try{
                result = JSON.parse(body);
                result.deposit = params.deposit;

                createTransaction(result).then(function(){
                    dfr.resolve(response);
                },function(err){
                    dfr.reject(err);
                });
            }
            catch(e){
                dfr.reject(e);
            }
        }
        else{
            dfr.reject(error);
        }
    })

    return dfr.promise;
}

function createTransaction(data){
    let dfr = Q.defer();
    let transaction = new Transaction({
        token: data.TranzilaTK,
        confirmationCode: data.ConfirmationCode,
        index: data.index,
        payment: data.sum,
        deposit: data.deposit,
        date: Date.now()
    });
    transaction.save(function (err, transaction) {
        if (err) return dfr.reject(err);
        return dfr.resolve(transaction._id);
    });
    return dfr.promise;
}


module.exports = router;

