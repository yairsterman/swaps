let mongoose = require('mongoose');
let config = require('../config.js');
let User = require('../models/User.js');
let Transaction = require('../models/transaction.js');
let Q = require('q');
let request = require('request');
let email = require('../services/email.js');
let emailMessages = require('../services/email-messages.js');
let Data = require('../user_data/data.js');


let error = {
    error: true,
    message: ''
};

const tranmode = 'A';

/**
 * Send a transaction request with the payment amount and save the
 * new transaction to the DB
 *
 * @param params - transaction details
 * @param userId - id of user to save the transaction on
 */
function completeTransaction(params, userId){

    let dfr = Q.defer();
    let requestUrl = `https://secure5.tranzila.com/cgi-bin/tranzila71pme.cgi`;

    request.post({
        headers : {"Content-Type": "application/x-www-form-urlencoded"},
        url: requestUrl,
        body: `supplier=${config.tranzillaSupplier}&TranzilaPW=${config.TranzilaPW}&TranzilaTK=${params.token}&tranmode=${tranmode}&sum=${params.sum}&currency=${params.currency}&cred_type=${params.cred_type}&response_return_format=json`
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let result;
            try{
                result = JSON.parse(body);
                result.deposit = params.deposit;

                createTransaction(result, userId).then(function(transactionId){
                    dfr.resolve(transactionId);
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
    });

    return dfr.promise;
}

/**
 * Create and save transaction in DB, then save transaction on user
 *
 * @param data - transaction data
 */
function createTransaction(data, userId){
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
        if (err)
            return dfr.reject(err);
        saveTransactionId(userId, transaction._id).then(function(transactionId){
            dfr.resolve(transactionId);
        },function(err){
            dfr.reject(err);
        });
    })
    return dfr.promise;
}

/**
 * Save transaction ID to user's transactions
 *
 * @param userId - user to whom the transaction belongs
 * @param transactionId - transaction ID
 */
function saveTransactionId(userId, transactionId){
    let dfr = Q.defer();
    let id = transactionId;

    User.update({_id: userId}, {$push: {transactions: transactionId}}, function (err, user) {
        if (err) {
            error.message = err;
            dfr.reject(error);
        }
        else {
            dfr.resolve(id);
        }
    });

    return dfr.promise;
}

module.exports = {
    completeTransaction: completeTransaction
};